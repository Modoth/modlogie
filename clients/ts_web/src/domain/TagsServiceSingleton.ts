import IServicesLocator from "../common/IServicesLocator";
import ITagsService, { Tag, TagType } from "./ITagsService";
import { Tag as TagDto } from "../apis/tags_pb";
import { TagsServiceClient } from "../apis/TagsServiceClientPb";
import Langs from "../view/Langs";
import { Error as ErrorMessage, StringId } from "../apis/messages_pb";
import { ClientRun } from "../common/GrpcUtils";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";

export default class TagsServiceSingleton extends IServicesLocator implements ITagsService {
    private cached: boolean;

    private nameTags: Map<string, Tag>
    private idTags: Map<string, Tag>

    private parseValues(values: string): string[] | undefined {
        if (!values) {
            return undefined;
        }
        return values.split(' ').map(s => s.trim()).filter(s => s);
    }

    private cloneTag(tag: Tag): Tag {
        return Object.assign({}, tag);
    }

    private tagFrom(item: TagDto): Tag {
        return new Tag(item.getId(), item.getName(), item.getType() as number, this.parseValues(item.getValues()))
    }

    constructor() {
        super();
        this.clearCache();
    }

    async all(): Promise<Tag[]> {
        await this.fetchCache();
        return Array.from(this.nameTags.values(), t => this.cloneTag(t));
    }

    async add(name: string, type: TagType, values?: string[] | undefined): Promise<Tag> {
        await this.fetchCache();
        var req = new TagDto().setName(name).setType(type as number).setValues(values ? values.join(' ') : '');
        var newItem = await (await ClientRun(() => this.locate(TagsServiceClient).add(req, null))).getTag()!;
        var tag = this.tagFrom(newItem);
        this.nameTags.set(tag.name, tag);
        this.idTags.set(tag.id, tag);

        return this.cloneTag(tag);
    }

    async delete(name: string): Promise<any> {
        await this.fetchCache();
        var tag = this.nameTags.get(name)
        if (!tag) {
            throw new Error(Langs[ErrorMessage.NO_SUCH_ENTITY])
        }
        await ClientRun(() => this.locate(TagsServiceClient).delete(new StringId().setId(tag!.id), null))
        this.nameTags.delete(tag.name);
        this.idTags.delete(tag.id);
    }

    async updateName(oldName: string, name: string): Promise<any> {
        await this.fetchCache();
        var tag = this.nameTags.get(oldName)
        if (!tag) {
            throw new Error(Langs[ErrorMessage.NO_SUCH_ENTITY])
        }
        await ClientRun(() => this.locate(TagsServiceClient).updateName(new TagDto().setId(tag!.id).setName(name), null))
        this.nameTags.delete(tag.name);
        tag.name = name;
        this.nameTags.set(tag.name, tag);
    }

    async updateValues(name: string, values?: string[]): Promise<any> {
        await this.fetchCache();
        var tag = this.nameTags.get(name)
        if (!tag) {
            throw new Error(Langs[ErrorMessage.NO_SUCH_ENTITY])
        }
        await ClientRun(() => this.locate(TagsServiceClient).updateValues(new TagDto().setId(tag!.id).setValues(values ? values.join(' ') : ''), null))
        tag.values = values;
    }

    async get(name: string): Promise<Tag | undefined> {
        await this.fetchCache();
        return this.nameTags.get(name);
    }

    async getById(id: string): Promise<Tag | undefined> {
        await this.fetchCache();
        return this.idTags.get(id);
    }

    async getValues(name: string): Promise<string[]> {
        await this.fetchCache();
        var tag = this.nameTags.get(name)
        if (tag && tag.values) {
            return tag.values!;
        }
        return [];
    }

    async fetchCache(): Promise<void> {
        if (this.cached) {
            return
        }
        var tags = (await ClientRun(() => this.locate(TagsServiceClient).getAll(new Empty(), null))).getTagsList();
        this.nameTags = new Map(tags.map(t => [t.getName(), this.tagFrom(t)]))
        this.idTags = new Map(tags.map(t => [t.getId(), this.tagFrom(t)]))
        this.cached = true;
    }

    clearCache(): void {
        this.nameTags = new Map();
        this.idTags = new Map();
        this.cached = false;
    }

}