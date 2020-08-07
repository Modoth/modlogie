import Article, { ArticleContent, ArticleFile, ArticleAdditionalType } from "./Article"
import { Query } from "../apis/files_pb"
import IFilesServiceBase from "./IFilesServiceBase"

export default class IArticleService extends IFilesServiceBase {
    all(subjectId: string, skip: number, take: number): Promise<[number, Article[]]> {
        throw new Error('Method not implemented.')
    }

    query(query: Query, filter: string | undefined, skip: number, take: number): Promise<[number, Article[]]> {
        throw new Error('Method not implemented.')
    }

    add(name: string, subjectId: string): Promise<Article> {
        throw new Error('Method not implemented.')
    }

    move(articleId: string, subjectId: string): Promise<Article> {
        throw new Error('Method not implemented.')
    }

    delete(articleId: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    rename(name: string, articleId: string): Promise<Article> {
        throw new Error('Method not implemented.')
    }

    updateArticleContent(article: Article, content: ArticleContent, hiddenSections?: Set<string>, files?: ArticleFile[]) {
        throw new Error('Method not implemented.')
    }

    updateAdditionalType(id: string, type: ArticleAdditionalType): Promise<void> {
        throw new Error('Method not implemented.')
    }
}