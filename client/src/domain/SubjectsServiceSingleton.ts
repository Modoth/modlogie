import Subject from './Subject'
import ISubjectsService from './ISubjectsService'
import IServicesLocator from '../common/IServicesLocator'
import { FilesServiceClient } from '../apis/FilesServiceClientPb'
import { ClientRun } from '../common/GrpcUtils'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { File, AddRequest, UpdateNameRequest } from '../apis/files_pb'
import { StringId } from '../apis/messages_pb'

export default class SubjectsServiceSingleton extends IServicesLocator implements ISubjectsService {
  private cached: boolean;
  private subjects: Subject[]
  private allSubjects: Map<string, Subject>

  async all(): Promise<Subject[]> {
    await this.loadCache();
    return this.subjects.map(s => s.clone());
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

  async add(name: string, parentId?: string | undefined): Promise<Subject> {
    await this.loadCache();
    var res = await ClientRun(() => this.locate(FilesServiceClient).add(new AddRequest().setFileType(File.FileType.FOLDER).setName(name).setParentId(parentId || ''), null))
    var sbj = this.subjectFrom(res.getFile()!);
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

  async loadCache(): Promise<any> {
    if (this.cached) {
      return
    }
    var folders = (await ClientRun(() => this.locate(FilesServiceClient).getFolders(new Empty(), null))).getFilesList();
    this.subjects = [];
    this.allSubjects = new Map(folders.map(f => [f.getId(), this.subjectFrom(f)]));
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
      }
      subject.totalArticleCount = totalCount;
      return subject.totalArticleCount;
    }
    for (var sbj of this.subjects) {
      updateTotalArticleCount(sbj);
    }
    this.cached = true;
  }

  private subjectFrom(item: File): Subject {
    var sbj = new Subject()
    sbj.id = item.getId();
    sbj.name = item.getName();
    sbj.path = item.getPath();
    sbj.articleCount = item.getNormalFilesCount();
    return sbj;
  }

  clearCache(): void {
    this.cached = false;
    this.subjects = [];
  }

}
