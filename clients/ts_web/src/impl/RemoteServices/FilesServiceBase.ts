import { AddOrUpdateTagsRequest, FileTag, AddResourceRequest, DeleteTagsRequest } from '../remote-apis/files_pb'
import { FilesServiceClient } from '../remote-apis/FilesServiceClientPb'
import { StringId } from '../remote-apis/messages_pb'
import IFilesServiceBase from '../../domain/ServiceInterfaces/IFilesServiceBase'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default class FilesServiceBase extends IServicesLocator implements IFilesServiceBase {
  async updateTags (articleId: string, ...tags: { id: string; value: string | Uint8Array; contentType?: string }[]): Promise<string[]> {
    let langs = this.locate(ILangsService)
    let res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).addOrUpdateTags(
      new AddOrUpdateTagsRequest()
        .setId(articleId)
        .setTagsList(tags.map(t => {
          let tag = new FileTag().setTagId(t.id)
          if (typeof t.value === 'string') {
            tag.setValue(t.value)
          } else {
            if (!t.contentType) {
              throw new Error(langs.get(LangKeys.MSG_ERROR_INVALID_ARGUMENTS))
            }
            tag.setContent(t.value).setContentType(t.contentType)
          }
          return tag
        }))
      , null))
    return res.getTagContentsList()
  }

  async deleteTag (articleId: string, tagId: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).deleteTags(
      new DeleteTagsRequest()
        .setId(articleId)
        .setTagsList([new FileTag().setTagId(tagId)])
      , null))
  }

  async addFile (parentId: string, type: string, content: Uint8Array): Promise<[string, string]> {
    let res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).addResource(new AddResourceRequest().setParentId(parentId).setType(type).setContent(content), null))
    return [res.getId(), res.getContentId()]
  }

  async deleteFile (_: string, fileId: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).delete(new StringId().setId(fileId), null))
  }
}
