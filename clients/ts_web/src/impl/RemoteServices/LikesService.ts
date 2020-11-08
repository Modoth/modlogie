import { FilesServiceClient } from '../remote-apis/FilesServiceClientPb'
import { IncDecTagRequest } from '../remote-apis/files_pb'
import { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import Article from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILikesService from '../../domain/ServiceInterfaces/ILikesService'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ITagsService, { TagNames } from '../../domain/ServiceInterfaces/ITagsService'

export default class LikesService extends IServicesLocator implements ILikesService {
  private async getLikeTagId (): Promise<string | undefined> {
    return (await this.locate(ITagsService).get(TagNames.LIKE_TAG_NAME))?.id
  }

  private async getDislikeTagId (): Promise<string | undefined> {
    return (await this.locate(ITagsService).get(TagNames.DISLIKE_TAG_NAME))?.id
  }

  async addLike (articleId: string): Promise<void> {
    let tagId = await this.getLikeTagId()
    if (!tagId) {
      throw new Error(LangKeys.MSG_ERROR_INVALID_OPERATION)
    }
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).increaseTag(
      new IncDecTagRequest().setFileId(articleId).setTagId(tagId!), null))
  }

  async addDislike (articleId: string): Promise<void> {
    let tagId = await this.getDislikeTagId()
    if (!tagId) {
      throw new Error(LangKeys.MSG_ERROR_INVALID_OPERATION)
    }
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).increaseTag(
      new IncDecTagRequest().setFileId(articleId).setTagId(tagId!), null))
  }

  async canLike (articleId: string): Promise<boolean> {
    return true
  }

  async canDislike (articleId: string): Promise<boolean> {
    return true
  }

  async enabled (): Promise<boolean> {
    return await this.locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.ALLOW_LIKES)
  }

  async likeCount (article: Article): Promise<number> {
    return parseInt(article.tagsDict?.get(TagNames.LIKE_TAG_NAME)?.value || '') || 0
  }

  async dislikeCount (article: Article): Promise<number> {
    return parseInt(article.tagsDict?.get(TagNames.DISLIKE_TAG_NAME)?.value || '') || 0
  }
}
