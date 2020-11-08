import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import Article from '../../domain/ServiceInterfaces/Article'

export interface IArticleListChangedListener {
    (): void
}

export default class IArticleListService {
  add (article: Article, type: ArticleContentType, onRemoved: { (): void }) {
    throw new Error('Method not implemented.')
  }

  getArticles (skip?: number, take?: number): Promise<[number, [Article, ArticleContentType][]]> {
    throw new Error('Method not implemented.')
  }

  has (article: Article): boolean {
    throw new Error('Method not implemented.')
  }

  remove (article: Article) {
    throw new Error('Method not implemented.')
  }

  clear () {
    throw new Error('Method not implemented.')
  }

  all (): [Article, ArticleContentType][] {
    throw new Error('Method not implemented.')
  }

  addChangeListener (listener: IArticleListChangedListener): void {
    throw new Error('Method not implemented.')
  }

  removeChangeListener (listener: IArticleListChangedListener): void {
    throw new Error('Method not implemented.')
  }
}
