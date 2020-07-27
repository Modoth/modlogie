import Subject from './Subject'
import ISubjectsService from './ISubjectsService'
import { FilesServiceClient } from '../apis/FilesServiceClientPb'
import { ClientRun } from '../common/GrpcUtils'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { File, AddRequest, UpdateNameRequest, FilesReply, UpdateCommentRequest } from '../apis/files_pb'
import { StringId } from '../apis/messages_pb'
import { BinaryReader } from 'google-protobuf'
import FilesServiceBase from './FilesServiceBase'
import ITagsService, { TagNames, TagType } from './ITagsService'

export default class SubjectsServiceSingleton extends FilesServiceBase implements ISubjectsService {
  private cached: boolean;
  private subjects: Subject[]
  private allSubjects: Map<string, Subject>
  private ICON_TAG = TagNames.RESERVED_PREFIX + 'icon';
  private loadingTask?: Promise<void>

  async all(rootChildName?: string): Promise<Subject[]> {
    await this.loadCache();
    if (!rootChildName) {
      return this.subjects.map(s => s.clone());
    }
    var parent = this.subjects.find(s => s.name == rootChildName);
    if (!parent) {
      return [];
    }
    return [parent.clone()];
  }

  private addSubjectToCache(subject: Subject, parentId?: string) {
    this.allSubjects.set(subject.id, subject);
    if (parentId) {
      subject.parent = this.allSubjects.get(parentId)!
      subject.parent.children = subject.parent.children || []
      subject.parent.children.push(subject);
    } else {
      this.subjects.push(subject);
    }
  }

  private removeSubjectFromCache(subject: Subject) {
    this.allSubjects.delete(subject.id)
    if (subject.parent) {
      subject.parent.children = subject.parent.children!.filter(s => s !== subject)
    } else {
      this.subjects = this.subjects.filter(s => s !== subject)
    }
  }

  private async getIconTag(create = false): Promise<string | undefined> {
    var tagservice = this.locate(ITagsService);
    var iconTag = await tagservice.get(this.ICON_TAG);
    if (iconTag == null && create) {
      iconTag = await tagservice.add(this.ICON_TAG, TagType.RESOURCE)
    }
    return iconTag?.id;
  }


  async setIcon(subjectId: string, type: string, content: Uint8Array): Promise<string> {
    await this.loadCache();
    var subject = this.allSubjects.get(subjectId)!;
    var iconTagId = await this.getIconTag(true);
    var res = await this.updateTags(subjectId, { id: iconTagId!, value: content, contentType: type })
    subject.iconUrl = res[0];
    return subject.iconUrl;
  }

  async resetIcon(subjectId: string): Promise<void> {
    await this.loadCache();
    var subject = this.allSubjects.get(subjectId)!;
    var iconTagId = await this.getIconTag(true);
    if (subject.iconUrl && iconTagId) {
      await this.deleteTag(subjectId, iconTagId)
    }

    subject.iconUrl = undefined;
    return;
  }


  async add(name: string, parentId?: string | undefined): Promise<Subject> {
    await this.loadCache();
    var res = await ClientRun(() => this.locate(FilesServiceClient).add(new AddRequest().setFileType(File.FileType.FOLDER).setName(name).setParentId(parentId || ''), null))
    var sbj = await this.subjectFrom(res.getFile()!);
    this.addSubjectToCache(sbj, parentId);
    return sbj.clone()
  }

  async delete(subjectId: string): Promise<void> {
    await this.loadCache();
    var subject = this.allSubjects.get(subjectId)!;
    await ClientRun(() => this.locate(FilesServiceClient).delete(new StringId().setId(subject.id), null))
    this.removeSubjectFromCache(subject);
  }

  async rename(name: string, subjectId: string): Promise<Subject> {
    await this.loadCache();
    var subject = this.allSubjects.get(subjectId)!;
    var newItem = await (await ClientRun(() => this.locate(FilesServiceClient).updateName(new UpdateNameRequest().setId(subject.id).setName(name), null))).getFile()!
    subject.name = newItem.getName();
    subject.path = newItem.getPath();
    return subject.clone();
  }

  async setOrder(subjectId: string, order: number): Promise<void> {
    await this.loadCache();
    var subject = this.allSubjects.get(subjectId)!;
    await (await ClientRun(() => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(subject.id).setComment(Infinity === order ? '' : order.toString()), null)))!
    subject.order = order;
    return;
  }

  async loadCache(): Promise<any> {
    if (this.cached) {
      return
    }
    if (this.loadingTask) {
      return this.loadingTask;
    }
    this.loadingTask = this.loadCacheInternal().then(() => this.loadingTask = undefined);
    await this.loadingTask
    this.cached = true;
  }

  async loadCacheInternal(): Promise<any> {
    var res = (await ClientRun(() => this.locate(FilesServiceClient).getFolders(new Empty(), null)));
    var folders = res.getFilesList();
    var version = res.getVersion()
    if (!(folders && folders.length) && version) {
      try {
        var cachedRes = new FilesReply();
        var reader = new BinaryReader(await (await fetch(version)).arrayBuffer());
        FilesReply.deserializeBinaryFromReader(cachedRes, reader)
        folders = cachedRes.getFilesList();
      } catch{
        folders = [];
      }
    }
    this.subjects = [];
    this.allSubjects = new Map();
    for (var f of folders) {
      this.allSubjects.set(f.getId(), await this.subjectFrom(f))
    }
    for (var folder of folders) {
      var id = folder.getId();
      var sbj = this.allSubjects.get(id)!;
      var parentId = folder.getParentId();
      if (parentId) {
        var parent = this.allSubjects.get(parentId)!;
        sbj.parent = parent;
        parent.children = parent.children || [];
        parent.children.push(sbj);
      } else {
        this.subjects.push(sbj)
      }
    }
    const updateTotalArticleCount = (subject: Subject): number => {
      var totalCount = subject.articleCount;
      if (subject.children) {
        for (var c of subject.children) {
          totalCount += updateTotalArticleCount(c);
        }
        subject.children = subject.children.sort((a, b) => a.order - b.order);
      }
      subject.totalArticleCount = totalCount;
      return subject.totalArticleCount;
    }
    for (var sbj of this.subjects) {
      updateTotalArticleCount(sbj);
    }
    this.subjects.sort((a, b) => a.order - b.order)
  }

  private async subjectFrom(item: File): Promise<Subject> {
    var sbj = new Subject()
    sbj.id = item.getId();
    sbj.name = item.getName();
    sbj.path = item.getPath();
    sbj.order = parseInt(item.getComment());
    if (isNaN(sbj.order)) {
      sbj.order = Infinity;
    }
    sbj.articleCount = item.getNormalFilesCount();
    var tags = item.getTagsList()
    if (!tags || !tags.length) {
      return sbj;

    }
    var iconTagId = await this.getIconTag();
    if (iconTagId) {
      sbj.iconUrl = tags.find(t => t.getTagId() == iconTagId)?.getValue();
    }
    return sbj;
  }

  clearCache(): void {
    this.cached = false;
    this.subjects = [];
  }

}
