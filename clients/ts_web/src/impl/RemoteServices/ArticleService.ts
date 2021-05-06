import { File, AddRequest, UpdateContentRequest, UpdateNameRequest, MoveRequest, GetFilesRequest, Query, QueryRequest, AddResourceRequest, UpdateCommentRequest, UpdateAdditionalTypeRequest, UpdatePublishedRequest, Condition } from '../remote-apis/files_pb'
import { FilesServiceClient } from '../remote-apis/FilesServiceClientPb'
import { StringId } from '../remote-apis/messages_pb'
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb'
import Article, { ArticleTag, ArticleContent, ArticleFile, ArticleAdditionalType } from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import FilesServiceBase from './FilesServiceBase'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import ITagsService, { TagNames } from '../../domain/ServiceInterfaces/ITagsService'

export default class ArticleService extends FilesServiceBase implements IArticleService {
  Query ():any {
    return Query
  }

  Condition ():any {
    return Condition
  }

  private async tryParseContent (url: string): Promise<any> {
    try {
      const contentBase = (window.ENV_OVERRIDE || ENV).CONTENT_BASE || ""
      url = contentBase  + url
      return await (await fetch(url, contentBase ? { mode: 'cors' } : undefined)).json()
    } catch (e) {
      console.log(e)
    }
    return { content: { sections: [] }, files: [] }
  }

  private async ArticleFrom (item: File): Promise<Article> {
    const contentUrl = item.getContent()
    const additionId = item.getComment()
    const tagsService = this.locate(ITagsService)
    const tags = []
    const publishes = new Map<string, string>()
    for (const t of item.getTagsList()) {
      const tag = await tagsService.getById(t.getTagId())
      if (!tag) {
        console.log('No such tag', tag)
        continue
      }
      tags.push(new ArticleTag(tag!.name, tag!.values || [], tag!.id, t.getValue()))
      if (tag.name.startsWith(TagNames.RESERVED_SHARE_PREFIX)) {
        var publish = tag.name.slice(TagNames.RESERVED_SHARE_PREFIX.length)
        if (publish) {
          publishes.set(publish, t.getValue())
        }
      }
    }
    const article: Article = {
      name: item.getName(),
      id: item.getId(),
      path: item.getPath(),
      subjectId: item.getParentId(),
      published: item.getPublished()!.toDate(),
      additionalType: item.getAdditionalType() as ArticleAdditionalType,
      publishedIds: publishes,
      tags,
      tagsDict: new Map(tags.map(t => [t.name, t]))
    }
    let loadingTask: Promise<void> | undefined
    if (contentUrl) {
      article.lazyLoading = () => {
        if (loadingTask) {
          return loadingTask
        }
        loadingTask = new Promise((resolve) => {
          this.tryParseContent(contentUrl).then(({ content, files }) => {
            article.content = content
            article.files = files
            article.lazyLoading = undefined
            loadingTask = undefined
            resolve()
          })
        })
        return loadingTask
      }
    }
    let loadingAdditionTask: Promise<void> | undefined

    if (additionId) {
      article.additionId = additionId
      article.lazyLoadingAddition = () => {
        if (loadingAdditionTask) {
          return loadingAdditionTask
        }
        // eslint-disable-next-line no-async-promise-executor
        loadingAdditionTask = new Promise(async (resolve) => {
          try {
            if (article.lazyLoading) {
              await article.lazyLoading()
            }
            const additionalFile = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).getResourceById(new StringId().setId(additionId), null))).getFile()
            if (additionalFile) {
              const additionalUrl = additionalFile.getContent()
              const { content }: { content: ArticleContent } = await this.tryParseContent(additionalUrl)
              if (content && content.sections && content.sections.length) {
                                article.content!.sections!.push(...content.sections)
              }
            }
          } catch {
          }
          article.lazyLoadingAddition = undefined
          loadingAdditionTask = undefined
          resolve()
        })
        return loadingAdditionTask
      }
    }
    return article
  }

  async all (subjectId: string, skip: number, take: number): Promise<[number, Article[]]> {
    const res = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).getFiles(new GetFilesRequest().setParentId(subjectId || '').setSkip(skip).setTake(take), null)))
    const items = res.getFilesList()
    const total = res.getTotal()
    const articles = []
    for (const i of items) {
      articles.push(await this.ArticleFrom(i))
    }
    return [total, articles]
  }

  async query (query: Query, filter: string | undefined, skip: number, take: number): Promise<[number, Article[]]> {
    const res = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).query(new QueryRequest().setQuery(query).setSkip(skip).setTake(take).setFilter(filter || ''), null)))
    const items = res.getFilesList()
    const total = res.getTotal()
    const articles = []
    for (const i of items) {
      articles.push(await this.ArticleFrom(i))
    }
    return [total, articles]
  }

  async add (name: string, subjectId: string): Promise<Article> {
    const item = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).add(new AddRequest().setName(name).setFileType(File.FileType.NORMAL).setParentId(subjectId), null))
    return this.ArticleFrom(item.getFile()!)
  }

  async delete (articleId: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).delete(new StringId().setId(articleId), null))
  }

  async rename (name: string, articleId: string): Promise<Article> {
    const item = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateName(new UpdateNameRequest().setName(name).setId(articleId), null))
    return this.ArticleFrom(item.getFile()!)
  }

  async updateAdditionalType (id: string, type: ArticleAdditionalType): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateAdditionalType(new UpdateAdditionalTypeRequest().setId(id).setAdditionalType(type), null))
  }

  async updatePublished (id: string, published: Date): Promise<void> {
    const publishedDate = new Timestamp()
    publishedDate.fromDate(published)
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updatePublished(new UpdatePublishedRequest().setId(id).setPublished(publishedDate), null))
  }

  async move (articleId: string, subjectId: string): Promise<Article> {
    const item = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).move(new MoveRequest().setId(articleId).setParentid(subjectId), null))
    return this.ArticleFrom(item.getFile()!)
  }

  async updateArticleContent (article: Article, content: ArticleContent, hiddenSections?: Set<string>, files?: ArticleFile[]) {
    const resourceIds = files ? files.map((f) => f.id!) : undefined
    const allSections = new Map((content?.sections || []).map(s => [s.name!, s!]))
    const hiddenContent: ArticleContent = { sections: [] }
    if (hiddenSections && hiddenSections.size) {
      hiddenSections.forEach(name => {
        if (allSections.has(name)) {
                    hiddenContent.sections!.push(allSections.get(name)!)
                    allSections.delete(name)
        }
      })
    }
    const normalContent: ArticleContent = { sections: Array.from(allSections.values()) }
    if (hiddenContent.sections!.length) {
      const hiddenContentStr = JSON.stringify({ content: hiddenContent })
      if (!article.additionId) {
        const shadowSectionPrivate = await this.locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.SHADOW_SECTION_PRIVATE)
        const additionId = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).addResource(new AddResourceRequest().setParentId(article.id!).setTextContent(hiddenContentStr).setPrivate(shadowSectionPrivate), null))).getId()
        await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(article.id!).setComment(additionId), null))
        article.additionId = additionId
      } else {
        await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateContent(new UpdateContentRequest().setId(article.additionId!).setContent(hiddenContentStr), null))
      }
    } else {
      if (article.additionId) {
        await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).delete(new StringId().setId(article.additionId!), null))
        await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(article.id!).setComment(''), null))
        article.additionId = undefined
      }
    }
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).updateContent(new UpdateContentRequest().setId(article.id!).setContent(JSON.stringify({ content: normalContent, files })).setResourceIdsList(resourceIds || []), null))
  }
}
