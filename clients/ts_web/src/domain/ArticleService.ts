import Article, { ArticleTag, ArticleContent, ArticleFile, ArticleAdditionalType } from "./Article"
import IArticleService from "./IArticleService"
import { ClientRun } from "../common/GrpcUtils"
import { FilesServiceClient } from "../apis/FilesServiceClientPb"
import { StringId } from "../apis/messages_pb"
import { File, AddRequest, UpdateContentRequest, UpdateNameRequest, MoveRequest, GetFilesRequest, Query, QueryRequest, AddResourceRequest, UpdateCommentRequest, UpdateAdditionalTypeRequest, UpdatePublishedRequest } from "../apis/files_pb"
import ITagsService from "./ITagsService"
import FilesServiceBase from "./FilesServiceBase"
import IConfigsService from "./IConfigsSercice"
import ConfigKeys from "../app/ConfigKeys"
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb"

export default class ArticleService extends FilesServiceBase implements IArticleService {

    private async tryParseContent(url: string): Promise<any> {
        try {
            return await (await fetch(url)).json()
        } catch (e) {
            console.log(e)
        }
        return { content: { sections: [] }, files: [] }
    }
    private async ArticleFrom(item: File): Promise<Article> {
        var contentUrl = item.getContent();
        var additionId = item.getComment();
        var tagsService = this.locate(ITagsService);
        var tags = [];
        for (var t of item.getTagsList()) {
            var tag = await tagsService.getById(t.getTagId())
            if (!tag) {
                console.log('No such tag', tag)
                continue;
            }
            tags.push(new ArticleTag(tag!.name, tag!.values || [], tag!.id, t.getValue()));
        }
        var article: Article = {
            name: item.getName(),
            id: item.getId(),
            path: item.getPath(),
            subjectId: item.getParentId(),
            published: item.getPublished()!.toDate(),
            additionalType: item.getAdditionalType() as ArticleAdditionalType,
            tags,
            tagsDict: new Map(tags.map(t => [t.name, t]))
        };
        let loadingTask: Promise<void> | undefined
        if (contentUrl) {
            article.lazyLoading = () => {
                if (loadingTask) {
                    return loadingTask;
                }
                loadingTask = new Promise(async (resolve) => {
                    const { content, files } = await this.tryParseContent(contentUrl);
                    article.content = content;
                    article.files = files;
                    article.lazyLoading = undefined
                    loadingTask = undefined;
                    resolve()
                })
                return loadingTask;
            }
        }
        let loadingAdditionTask: Promise<void> | undefined

        if (additionId) {
            article.additionId = additionId;
            article.lazyLoadingAddition = () => {
                if (loadingAdditionTask) {
                    return loadingAdditionTask;
                }
                loadingAdditionTask = new Promise(async (resolve) => {
                    try {
                        if (article.lazyLoading) {
                            await article.lazyLoading()
                        }
                        var additionalFile = await (await ClientRun(this, () => this.locate(FilesServiceClient).getResourceById(new StringId().setId(additionId), null))).getFile()
                        if (additionalFile) {
                            const additionalUrl = additionalFile.getContent();
                            const { content }: { content: ArticleContent } = await this.tryParseContent(additionalUrl);
                            if (content && content.sections && content.sections.length) {
                                article.content!.sections!.push(...content.sections)
                            }
                        }
                    }
                    catch {
                    }
                    article.lazyLoadingAddition = undefined
                    loadingAdditionTask = undefined
                    resolve();
                })
                return loadingAdditionTask;
            }
        }
        return article;
    }

    async all(subjectId: string, skip: number, take: number): Promise<[number, Article[]]> {
        var res = await (await ClientRun(this, () => this.locate(FilesServiceClient).getFiles(new GetFilesRequest().setParentId(subjectId || '').setSkip(skip).setTake(take), null)));
        var items = res.getFilesList();
        var total = res.getTotal();
        var articles = [];
        for (var i of items) {
            articles.push(await this.ArticleFrom(i))
        }
        return [total, articles];
    }

    async query(query: Query, filter: string | undefined, skip: number, take: number): Promise<[number, Article[]]> {
        var res = await (await ClientRun(this, () => this.locate(FilesServiceClient).query(new QueryRequest().setQuery(query).setSkip(skip).setTake(take).setFilter(filter || ''), null)));
        var items = res.getFilesList();
        var total = res.getTotal();
        var articles = [];
        for (var i of items) {
            articles.push(await this.ArticleFrom(i))
        }
        return [total, articles];
    }

    async add(name: string, subjectId: string): Promise<Article> {
        var item = await ClientRun(this, () => this.locate(FilesServiceClient).add(new AddRequest().setName(name).setFileType(File.FileType.NORMAL).setParentId(subjectId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async delete(articleId: string): Promise<void> {
        await ClientRun(this, () => this.locate(FilesServiceClient).delete(new StringId().setId(articleId), null))
    }

    async rename(name: string, articleId: string): Promise<Article> {
        var item = await ClientRun(this, () => this.locate(FilesServiceClient).updateName(new UpdateNameRequest().setName(name).setId(articleId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async updateAdditionalType(id: string, type: ArticleAdditionalType): Promise<void> {
        await ClientRun(this, () => this.locate(FilesServiceClient).updateAdditionalType(new UpdateAdditionalTypeRequest().setId(id).setAdditionalType(type), null))
    }

    async updatePublished(id: string, published: Date): Promise<void> {
        var publishedDate = new Timestamp();
        publishedDate.fromDate(published)
        await ClientRun(this, () => this.locate(FilesServiceClient).updatePublished(new UpdatePublishedRequest().setId(id).setPublished(publishedDate), null))
    }

    async move(articleId: string, subjectId: string): Promise<Article> {
        var item = await ClientRun(this, () => this.locate(FilesServiceClient).move(new MoveRequest().setId(articleId).setParentid(subjectId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async updateArticleContent(article: Article, content: ArticleContent, hiddenSections?: Set<string>, files?: ArticleFile[]) {
        var resourceIds = files ? files.map((f) => f.id!) : undefined
        var allSections = new Map((content?.sections || []).map(s => [s.name!, s!]))
        var hiddenContent: ArticleContent = { sections: [] }
        if (hiddenSections && hiddenSections.size) {
            hiddenSections.forEach(name => {
                if (allSections.has(name)) {
                    hiddenContent.sections!.push(allSections.get(name)!)
                    allSections.delete(name);
                }
            })
        }
        var normalContent: ArticleContent = { sections: Array.from(allSections.values()) };
        if (hiddenContent.sections!.length) {
            var hiddenContentStr = JSON.stringify({ content: hiddenContent });
            if (!article.additionId) {
                var shadowSectionPrivate = await this.locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.SHADOW_SECTION_PRIVATE);
                var additionId = await (await ClientRun(this, () => this.locate(FilesServiceClient).addResource(new AddResourceRequest().setParentId(article.id!).setTextContent(hiddenContentStr).setPrivate(shadowSectionPrivate), null))).getId();
                await ClientRun(this, () => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(article.id!).setComment(additionId), null));
                article.additionId = additionId;
            } else {
                await ClientRun(this, () => this.locate(FilesServiceClient).updateContent(new UpdateContentRequest().setId(article.additionId!).setContent(hiddenContentStr), null))
            }
        } else {
            if (article.additionId) {
                await ClientRun(this, () => this.locate(FilesServiceClient).delete(new StringId().setId(article.additionId!), null))
                await ClientRun(this, () => this.locate(FilesServiceClient).updateComment(new UpdateCommentRequest().setId(article.id!).setComment(''), null));
                article.additionId = undefined;
            }
        }
        await ClientRun(this, () => this.locate(FilesServiceClient).updateContent(new UpdateContentRequest().setId(article.id!).setContent(JSON.stringify({ content: normalContent, files })).setResourceIdsList(resourceIds || []), null))
    }
}