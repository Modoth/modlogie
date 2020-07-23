import IServicesLocator from "../common/IServicesLocator";
import IFilesService from "./IFilesService";
import { ClientRun } from "../common/GrpcUtils";
import { FilesServiceClient } from "../apis/FilesServiceClientPb";
import { AddOrUpdateTagsRequest, FileTag, AddResourceRequest } from "../apis/files_pb";

export default class FilesService extends IServicesLocator implements IFilesService {
    async updateArticleTags(articleId: string, ...tags: { id: string; value: string; }[]): Promise<void> {
        await ClientRun(() => this.locate(FilesServiceClient).addOrUpdateTags(
            new AddOrUpdateTagsRequest()
                .setId(articleId)
                .setTagsList(tags.map(t => new FileTag().setTagId(t.id).setValue(t.value)))
            , null))
    }
    async deleteArticleTag(articleId: string, tagId: string): Promise<void> {
        await ClientRun(() => this.locate(FilesServiceClient).addOrUpdateTags(
            new AddOrUpdateTagsRequest()
                .setId(articleId)
                .setTagsList([new FileTag().setTagId(tagId)])
            , null))
    }

    async addFile(parentId: string, type: string, content: Uint8Array): Promise<[string, string]> {
        var res = await ClientRun(() => this.locate(FilesServiceClient).addResource(new AddResourceRequest().setParentId(parentId).setType(type).setContent(content), null))
        return [res.getId(), res.getContentId()];
    }
}