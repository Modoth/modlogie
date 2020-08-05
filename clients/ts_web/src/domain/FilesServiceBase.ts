import IServicesLocator from "../common/IServicesLocator";
import IFilesServiceBase from "./IFilesServiceBase";
import { ClientRun } from "../common/GrpcUtils";
import { FilesServiceClient } from "../apis/FilesServiceClientPb";
import { AddOrUpdateTagsRequest, FileTag, AddResourceRequest, DeleteTagsRequest } from "../apis/files_pb";
import { StringId, Error as ErrorMessage } from "../apis/messages_pb";
import Langs from "../view/Langs";

export default class FilesServiceBase extends IServicesLocator implements IFilesServiceBase {
    async updateTags(articleId: string, ...tags: { id: string; value: string | Uint8Array; contentType?: string }[]): Promise<string[]> {
        var res = await ClientRun(this, ()=>this.locate(FilesServiceClient).addOrUpdateTags(
            new AddOrUpdateTagsRequest()
                .setId(articleId)
                .setTagsList(tags.map(t => {
                    var tag = new FileTag().setTagId(t.id)
                    if (typeof t.value === 'string') {
                        tag.setValue(t.value);
                    } else {
                        if (!t.contentType) {
                            throw new Error(Langs[ErrorMessage.INVALID_ARGUMENTS]);
                        }
                        tag.setContent(t.value).setContentType(t.contentType)
                    }
                    return tag;
                }))
            , null))
        return res.getTagContentsList();
    }
    async deleteTag(articleId: string, tagId: string): Promise<void> {
        await ClientRun(this, ()=>this.locate(FilesServiceClient).deleteTags(
            new DeleteTagsRequest()
                .setId(articleId)
                .setTagsList([new FileTag().setTagId(tagId)])
            , null))
    }

    async addFile(parentId: string, type: string, content: Uint8Array): Promise<[string, string]> {
        var res = await ClientRun(this, ()=>this.locate(FilesServiceClient).addResource(new AddResourceRequest().setParentId(parentId).setType(type).setContent(content), null))
        return [res.getId(), res.getContentId()];
    }

    async deleteFile(_: string, fileId: string): Promise<void> {
        await ClientRun(this, ()=>this.locate(FilesServiceClient).delete(new StringId().setId(fileId), null))
    }
}