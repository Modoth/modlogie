import Article, { ArticleTag } from "./Article"
import IArticleService from "./IArticleService"
import { ClientRun } from "../common/GrpcUtils"
import { FilesServiceClient } from "../apis/FilesServiceClientPb"
import { StringId } from "../apis/messages_pb"
import { File, AddRequest, UpdateContentRequest, UpdateNameRequest, MoveRequest, GetFilesRequest, Query, QueryRequest } from "../apis/files_pb"
import ITagsService from "./ITagsService"
import FilesServiceBase from "./FilesServiceBase"

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
            subjectId: item.getParentId(),
            tags,
            tagsDict: new Map(tags.map(t => [t.name, t]))
        };
        if (contentUrl) {
            const { content, files } = await this.tryParseContent(contentUrl);
            article.content = content;
            article.files = files;
        }
        return article;
    }

    async all(subjectId: string, skip: number, take: number): Promise<[number, Article[]]> {
        var res = await (await ClientRun(() => this.locate(FilesServiceClient).getFiles(new GetFilesRequest().setParentId(subjectId || '').setSkip(skip).setTake(take), null)));
        var items = res.getFilesList();
        var total = res.getTotal();
        var articles = [];
        for (var i of items) {
            articles.push(await this.ArticleFrom(i))
        }
        return [total, articles];
    }

    async query(query: Query, filter: string | undefined, skip: number, take: number): Promise<[number, Article[]]> {
        var res = await (await ClientRun(() => this.locate(FilesServiceClient).query(new QueryRequest().setQuery(query).setSkip(skip).setTake(take).setFilter(filter || ''), null)));
        var items = res.getFilesList();
        var total = res.getTotal();
        var articles = [];
        for (var i of items) {
            articles.push(await this.ArticleFrom(i))
        }
        return [total, articles];
    }

    async add(name: string, subjectId: string): Promise<Article> {
        var item = await ClientRun(() => this.locate(FilesServiceClient).add(new AddRequest().setName(name).setFileType(File.FileType.NORMAL).setParentId(subjectId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async delete(articleId: string): Promise<void> {
        await ClientRun(() => this.locate(FilesServiceClient).delete(new StringId().setId(articleId), null))
    }

    async rename(name: string, articleId: string): Promise<Article> {
        var item = await ClientRun(() => this.locate(FilesServiceClient).updateName(new UpdateNameRequest().setName(name).setId(articleId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async move(articleId: string, subjectId: string): Promise<Article> {
        var item = await ClientRun(() => this.locate(FilesServiceClient).move(new MoveRequest().setId(articleId).setParentid(subjectId), null))
        return this.ArticleFrom(item.getFile()!);
    }

    async updateContent(content: string, articleId: string, resourceIds?: string[]) {
        await ClientRun(() => this.locate(FilesServiceClient).updateContent(new UpdateContentRequest().setId(articleId).setContent(content), null))
    }
}