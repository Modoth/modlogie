import { AddRequest, DeleteRequest } from '../remote-apis/publish_pb'
import { IPublishService } from '../../domain/ServiceInterfaces/IPublishService'
import { PublishServiceClient } from '../remote-apis/PublishServiceClientPb'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ITagsService, { TagNames, TagType } from '../../domain/ServiceInterfaces/ITagsService'

export default class PublishService extends IServicesLocator implements IPublishService {
  getTagByType = (type:string) => `${TagNames.RESERVED_SHARE_PREFIX}${type}`
  async publish (type: string, articleId: string, baseUrl: string, url: string, content: string): Promise<string> {
    var tagName = this.getTagByType(type)
    var tagsService = this.locate(ITagsService)
    var tag = await tagsService.get(tagName)
    if (!tag) {
      tag = await tagsService.add(tagName, TagType.STRING)
    }
    var res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(PublishServiceClient).add(
      new AddRequest().setArticleId(articleId).setType(type).setBaseurl(baseUrl).setUrl(url).setContent(content), null))
    var id = res.getId()
    await this.locate(IArticleService).updateTags(articleId, { id: tag.id, value: id })
    return id
  }

  async delete (type: string, articleId:string, id: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(PublishServiceClient).delete(new DeleteRequest().setId(id).setType(type), null))
    var tag = await this.locate(ITagsService).get(this.getTagByType(type))
    if (tag) {
      await this.locate(IArticleService).deleteTag(articleId, tag.id)
    }
  }
}
