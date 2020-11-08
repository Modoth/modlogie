import { BinaryReader } from 'google-protobuf'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { File, AddRequest, UpdateNameRequest, FilesReply, UpdateCommentRequest, MoveRequest, AddFoldersRequest, NewFolderItem } from '../remote-apis/files_pb'
import { FilesServiceClient } from '../remote-apis/FilesServiceClientPb'
import { StringId } from '../remote-apis/messages_pb'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import FilesServiceBase from './FilesServiceBase'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import ITagsService, { TagNames, TagType } from '../../domain/ServiceInterfaces/ITagsService'
import Subject from '../../domain/ServiceInterfaces/Subject'

export default class SubjectsServiceSingleton extends FilesServiceBase implements ISubjectsService {
  private cached: boolean;
  private subjects: Subject[]
  private allSubjects: Map<string, Subject>
  private pathSubjects: Map<string, Subject>
  private ICON_TAG = TagNames.RESERVED_PREFIX + 'icon';
  private loadingTask?: Promise<void>

  async all (rootChildName?: string): Promise<Subject[]> {
    await this.loadCache()
    if (!rootChildName) {
      return this.subjects.map(s => s.clone())
    }
    const parent = this.subjects.find(s => s.name === rootChildName)
    if (!parent) {
      return []
    }
    return [parent.clone()]
  }

  async get (id: string): Promise<Subject | undefined> {
    await this.loadCache()
    return this.allSubjects.get(id)?.clone()
  }

  async getByPath (path: string): Promise<Subject | undefined> {
    await this.loadCache()
    return this.pathSubjects.get(path)?.clone()
  }

  private addSubjectToCache (subject: Subject, parentId?: string) {
    this.allSubjects.set(subject.id, subject)
    this.pathSubjects.set(subject.path!, subject)
    if (parentId) {
      subject.parent = this.allSubjects.get(parentId)!
      subject.parent.children = subject.parent.children || []
      subject.parent.children.push(subject)
    } else {
      this.subjects.push(subject)
    }
  }

  private removeSubjectFromCache (subject: Subject) {
    this.allSubjects.delete(subject.id)
    this.pathSubjects.delete(subject.path!)

    if (subject.parent) {
      subject.parent.children = subject.parent.children!.filter(s => s !== subject)
    } else {
      this.subjects = this.subjects.filter(s => s !== subject)
    }
  }

  private async getIconTag (create = false): Promise<string | undefined> {
    const tagservice = this.locate(ITagsService)
    let iconTag = await tagservice.get(this.ICON_TAG)
    if (iconTag == null && create) {
      iconTag = await tagservice.add(this.ICON_TAG, TagType.RESOURCE)
    }
    return iconTag?.id
  }

  async setResource (subjectId: string, type: string, content: Uint8Array | string): Promise<string> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    const iconTagId = await this.getIconTag(true)
    const res = await this.updateTags(subjectId, { id: iconTagId!, value: content, contentType: type })
    subject.resourceUrl = res[0]
    return subject.resourceUrl
  }

  async resetResource (subjectId: string): Promise<void> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    const iconTagId = await this.getIconTag(true)
    if (subject.resourceUrl && iconTagId) {
      await this.deleteTag(subjectId, iconTagId)
    }

    subject.resourceUrl = undefined
  }

  async add (name: string, parentId?: string | undefined): Promise<Subject> {
    await this.loadCache()
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).add(new AddRequest().setFileType(File.FileType.FOLDER).setName(name).setParentId(parentId || ''), null))
    const sbj = await this.subjectFrom(res.getFile()!)
    this.addSubjectToCache(sbj, parentId)
    return sbj.clone()
  }

  async batchAdd (subjects: Subject[], parentId?: string) {
    await this.loadCache()
    const request = new AddFoldersRequest().setParentId(parentId || '')
    const autoFix = await this.locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.IMPORT_SUBJECTS_AUTOFIX)
    request.setAutoFix(autoFix)
    const subjectToNewFolderItem = (sbj: Subject): NewFolderItem => {
      const item = new NewFolderItem()
      item.setName(sbj.name)
      if (sbj.children && sbj.children.length) {
        const children = sbj.children.map(c => subjectToNewFolderItem(c))
        item.setChildrenList(children)
      }
      return item
    }
    request.setFoldersList(subjects.map(c => subjectToNewFolderItem(c)))
    await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).addFolders(request, null))).getFilesList()
    this.clearCache()
  }

  async delete (subjectId: string): Promise<void> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).delete(new StringId().setId(subject.id), null))
    this.removeSubjectFromCache(subject)
  }

  async rename (name: string, subjectId: string): Promise<Subject> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    const newItem = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateName(new UpdateNameRequest().setId(subject.id).setName(name), null))).getFile()!
    subject.name = newItem.getName()
    subject.path = newItem.getPath()
    return subject.clone()
  }

  async move (subjectId: string, parentId: string): Promise<Subject> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    const newParent = this.allSubjects.get(parentId)!
    const newItem = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).move(new MoveRequest().setId(subject.id).setParentid(newParent.id), null))).getFile()!
    subject.path = newItem.getPath()
    subject.parent!.children = subject.parent!.children!.filter(c => c.id !== subject.id)
    subject.parent = newParent
    subject.parent.children = subject.parent.children || []
    subject.parent.children.push(subject)
    return subject.clone()
  }

  async setOrder (subjectId: string, order: number): Promise<void> {
    await this.loadCache()
    const subject = this.allSubjects.get(subjectId)!
    await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(subject.id).setComment(Infinity === order ? '' : order.toString()), null)))!
    subject.order = order
  }

  async loadCache (): Promise<any> {
    if (this.cached) {
      return
    }
    if (this.loadingTask) {
      return this.loadingTask
    }
    this.loadingTask = this.loadCacheInternal().then(() => { this.loadingTask = undefined })
    await this.loadingTask
    this.cached = true
  }

  async loadCacheInternal (): Promise<any> {
    const res = (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).getFolders(new Empty(), null)))
    let folders = res.getFilesList()
    const version = res.getVersion()
    if (!(folders && folders.length) && version) {
      try {
        const cachedRes = new FilesReply()
        const reader = new BinaryReader(await (await fetch(version)).arrayBuffer())
        FilesReply.deserializeBinaryFromReader(cachedRes, reader)
        folders = cachedRes.getFilesList()
      } catch {
        folders = []
      }
    }
    this.subjects = []
    this.allSubjects = new Map()
    this.pathSubjects = new Map()
    for (const f of folders) {
      const sbj = await this.subjectFrom(f)
      this.allSubjects.set(sbj.id, sbj)
      this.pathSubjects.set(sbj.path!, sbj)
    }
    for (const folder of folders) {
      const id = folder.getId()
      const sbj = this.allSubjects.get(id)!
      const parentId = folder.getParentId()
      if (parentId) {
        const parent = this.allSubjects.get(parentId)!
        sbj.parent = parent
        parent.children = parent.children || []
        parent.children.push(sbj)
      } else {
        this.subjects.push(sbj)
      }
    }
    const updateTotalArticleCount = (subject: Subject): number => {
      let totalCount = subject.articleCount
      if (subject.children) {
        for (const c of subject.children) {
          totalCount += updateTotalArticleCount(c)
        }
        subject.children = subject.children.sort((a, b) => a.order - b.order)
      }
      subject.totalArticleCount = totalCount
      return subject.totalArticleCount
    }
    for (const sbj of this.subjects) {
      updateTotalArticleCount(sbj)
    }
    this.subjects.sort((a, b) => a.order - b.order)
  }

  private async subjectFrom (item: File): Promise<Subject> {
    const sbj = new Subject()
    sbj.id = item.getId()
    sbj.name = item.getName()
    sbj.path = item.getPath()
    sbj.order = parseInt(item.getComment())
    if (isNaN(sbj.order)) {
      sbj.order = Infinity
    }
    sbj.articleCount = item.getNormalFilesCount()
    const tags = item.getTagsList()
    if (!tags || !tags.length) {
      return sbj
    }
    const iconTagId = await this.getIconTag()
    if (iconTagId) {
      sbj.resourceUrl = tags.find(t => t.getTagId() === iconTagId)?.getValue()
    }
    return sbj
  }

  clearCache (): void {
    this.cached = false
    this.subjects = []
  }
}
