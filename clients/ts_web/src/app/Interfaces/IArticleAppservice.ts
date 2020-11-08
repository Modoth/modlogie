import { ArticleContentType, ArticleType } from '../../pluginbase/IPluginInfo'
import Article from '../../domain/ServiceInterfaces/Article'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'

export default class IArticleAppservice {
  getArticleType (configsService: IConfigsService, articleType: ArticleType, subTypeName?: string): Promise<ArticleContentType> {
    throw new Error('Method not implemented.')
  }

  fetchArticleByPath (path: string, loadingAddition = false): Promise<[Article | undefined, ArticleContentType | undefined, ArticleType | undefined]> {
    throw new Error('Method not implemented.')
  }
}
