import Article from "./Article"
import ILikesService from "./ILikesService"
import IServicesLocator from "../common/IServicesLocator"
import IConfigsService from "./IConfigsSercice"
import ITagsService, { TagNames } from "./ITagsService"
import { ClientRun } from "../common/GrpcUtils"
import { FilesServiceClient } from "../apis/FilesServiceClientPb"
import { IncDecTagRequest } from "../apis/files_pb"
import { Error as ErrorMessage } from "../apis/messages_pb";
import Langs from "../view/Langs";
import ConfigKeys from "../app/ConfigKeys"

export default class LikesService extends IServicesLocator implements ILikesService {

    private async getLikeTagId(): Promise<string | undefined> {
        return (await this.locate(ITagsService).get(TagNames.LIKE_TAG_NAME))?.id;
    }

    private async getDislikeTagId(): Promise<string | undefined> {
        return (await this.locate(ITagsService).get(TagNames.DISLIKE_TAG_NAME))?.id;
    }

    async addLike(articleId: string): Promise<void> {
        var tagId = await this.getLikeTagId()
        if (!tagId) {
            throw new Error(Langs[ErrorMessage.INVALID_OPERATION]);
        }
        await ClientRun(this, () => this.locate(FilesServiceClient).increaseTag(
            new IncDecTagRequest().setFileId(articleId).setTagId(tagId!), null))
    }

    async addDislike(articleId: string): Promise<void> {
        var tagId = await this.getDislikeTagId()
        if (!tagId) {
            throw new Error(Langs[ErrorMessage.INVALID_OPERATION]);
        }
        await ClientRun(this, () => this.locate(FilesServiceClient).increaseTag(
            new IncDecTagRequest().setFileId(articleId).setTagId(tagId!), null))
    }

    async canLike(articleId: string): Promise<boolean> {
        return true;
    }

    async canDislike(articleId: string): Promise<boolean> {
        return true;
    }

    async enabled(): Promise<boolean> {
        return await this.locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.ALLOW_LIKES);
    }

    async likeCount(article: Article): Promise<number> {
        return parseInt(article.tagsDict?.get(TagNames.LIKE_TAG_NAME)?.value || '') || 0;
    }

    async dislikeCount(article: Article): Promise<number> {
        return parseInt(article.tagsDict?.get(TagNames.DISLIKE_TAG_NAME)?.value || '') || 0;

    }
}