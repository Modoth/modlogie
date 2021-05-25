import { ArticleContentType, ArticleType } from '../../pluginbase/IPluginInfo'
import Article from '../../domain/ServiceInterfaces/Article'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'

export default class IArticleAppservice {
  getArticleType (configsService: IConfigsService, articleType: ArticleType, subTypeName?: string): Promise<ArticleContentType> {
    throw new Error('Method not implemented.')
  }

  fetchArticle (pathOrName: string, loadingAddition = false, root?:string): Promise<[Article | undefined, ArticleContentType | undefined, ArticleType | undefined]> {
    throw new Error('Method not implemented.')
  }

  fetchRandomArticle (loadingAddition = false): Promise<[Article | undefined, ArticleContentType | undefined, ArticleType | undefined]> {
    throw new Error('Method not implemented.')
  }

  getCacheOrFetch<TValue> (group:string, path:string, converter:{(article:Article):Promise<TValue|undefined>}):Promise<TValue|undefined> {
    throw new Error('Method not implemented.')
  }
}
