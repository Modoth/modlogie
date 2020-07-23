export default class IFilesService {
    updateArticleTags(articleId: string, ...tags: { id: string, value: string }[]): Promise<void> {
        throw new Error('Method not implemented.')
    }

    deleteArticleTag(articleId: string, tagId: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    addFile(parentId: string, type: string, content: Uint8Array): Promise<[string, string]> {
        throw new Error('Method not implemented.')
    }
}