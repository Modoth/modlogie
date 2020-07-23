import { ArticleContentType } from "../plugins/IPluginInfo"
import Article from "./Article";

export interface IArticleListChangedListener {
    (): void
}

export default class IArticleListService {
    add(article: Article, type: ArticleContentType) {
        throw new Error('Method not implemented.')
    }

    has(article: Article): boolean {
        throw new Error('Method not implemented.')
    }

    remove(article: Article) {
        throw new Error('Method not implemented.')
    }

    clear() {
        throw new Error('Method not implemented.')
    }

    all(): [Article, ArticleContentType][] {
        throw new Error('Method not implemented.')
    }

    addChangeListener(listener: IArticleListChangedListener): void {
        throw new Error('Method not implemented.')
    }

    removeChangeListener(listener: IArticleListChangedListener): void {
        throw new Error('Method not implemented.')
    }
}

export class ArticleListSingletonService implements IArticleListService {
    private all_: Article[] = []
    private types_ = new Map<string, ArticleContentType>()
    private listeners_ = new Set<IArticleListChangedListener>()

    add(article: Article, type: ArticleContentType): void {
        if (this.has(article)) {
            return
        }
        this.types_.set(article.id!, type)
        this.all_.push(article)
        this.raiseChange_()
    }

    has(article: Article): boolean {
        return this.types_.has(article.id!)
    }

    remove(article: Article): void {
        this.types_.delete(article.id!)
        this.all_ = this.all_.filter(i => article.id !== i.id)
        this.raiseChange_()
    }

    clear(): void {
        this.types_ = new Map()
        this.all_ = []
        this.raiseChange_()
    }

    all(): [Article, ArticleContentType][] {
        return this.all_.map(a => [a, this.types_.get(a.id!)!])
    }

    addChangeListener(listener: IArticleListChangedListener): void {
        this.listeners_.add(listener)
    }
    removeChangeListener(listener: IArticleListChangedListener): void {
        this.listeners_.delete(listener)
    }

    raiseChange_() {
        for (const listener of Array.from(this.listeners_.values())) {
            listener()
        }
    }
}