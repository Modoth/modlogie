export default class IFilesServiceBase {
    updateTags(articleId: string, ...tags: { id: string; value: string | Uint8Array; contentType?: string }[]): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    deleteTag(articleId: string, tagId: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    addFile(parentId: string, type: string, content: Uint8Array): Promise<[string, string]> {
        throw new Error('Method not implemented.')
    }

    deleteFile(parentId: string, fileId: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
}