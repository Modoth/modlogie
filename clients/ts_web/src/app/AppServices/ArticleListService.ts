import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import Article from '../../domain/ServiceInterfaces/Article'
import IArticleListService, { IArticleListChangedListener } from '../Interfaces/IArticleListService'

export class ArticleListSingletonService implements IArticleListService {
    private all_: Article[] = []
    private types_ = new Map<string, ArticleContentType>()
    private onRemoveds = new Map<Article, {(): void }>();
    private listeners_ = new Set<IArticleListChangedListener>()

    getArticles (skip: number, take: number): Promise<[number, [Article, ArticleContentType][]]> {
      throw new Error('Method not implemented.')
    }

    add (article: Article, type: ArticleContentType, onRemoved: { (): void }): void {
      if (this.has(article)) {
        return
      }
      this.types_.set(article.id!, type)
      this.all_.push(article)
      this.onRemoveds.set(article, onRemoved)
      this.raiseChange_()
    }

    has (article: Article): boolean {
      return this.types_.has(article.id!)
    }

    remove (article: Article): void {
      this.types_.delete(article.id!)
      this.all_ = this.all_.filter(i => article.id !== i.id)
      this.raiseChange_()
    }

    clear (): void {
      this.types_ = new Map()
      this.all_ = []
      this.onRemoveds.forEach((onRemoved) => {
        onRemoved && onRemoved()
      })
      this.onRemoveds = new Map()
      this.raiseChange_()
    }

    all (): [Article, ArticleContentType][] {
      return this.all_.map(a => [a, this.types_.get(a.id!)!])
    }

    addChangeListener (listener: IArticleListChangedListener): void {
      this.listeners_.add(listener)
    }

    removeChangeListener (listener: IArticleListChangedListener): void {
      this.listeners_.delete(listener)
    }

    raiseChange_ () {
      for (const listener of Array.from(this.listeners_.values())) {
        listener()
      }
    }
}
