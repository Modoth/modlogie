import Article from "./Article"
import { Query } from "../apis/files_pb"

export default class IArticleService {
    all(subjectId: string, skip: number, take: number): Promise<[number, Article[]]> {
        throw new Error('Method not implemented.')
    }

    query(query: Query, skip: number, take: number): Promise<[number, Article[]]> {
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

    updateContent(content: string, articleId: string, resourceIds?: string[]) {
        throw new Error('Method not implemented.')
    }
}