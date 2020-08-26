import IKeywordsService, { Keyword } from "./IKeywordsService";
import IServicesLocator from "../common/IServicesLocator";
import IConfigsService from "./IConfigsSercice";
import ConfigKeys from "../app/ConfigKeys";
import { Keyword as KeywordDto, GetAllRequest } from "../apis/keywords_pb";
import { ClientRun } from "../common/GrpcUtils";
import { KeywordsServiceClient } from "../apis/KeywordsServiceClientPb";
import { StringId } from "../apis/messages_pb";
import { title } from "process";

export default class KeywordsService extends IServicesLocator implements IKeywordsService {
    private _caches?: Map<string, Keyword | undefined>;
    private _templates: Map<string, string>
    private loaded = false;
    async get(keyword: string): Promise<Keyword> {
        if (!this._caches) {
            this._caches = new Map();
        }
        if (!this._caches!.has(keyword)) {
            try {
                var dto = (await ClientRun(this, () => this.locate(KeywordsServiceClient).get(
                    new StringId().setId(keyword), null))).getKeyword()
                this._caches!.set(keyword, dto && this.keywordFrom(dto))
            }
            catch{
                //ignore
            }
        }
        var keywordItem: Keyword = this._caches!.get(keyword) || { id: keyword, url: '' };
        if (keywordItem.efficialUrl) {
            return keywordItem
        }

        if (!keywordItem.searchKeys || !keywordItem.searchKeys.size) {
            keywordItem.efficialUrl = 'about://blank'
            return keywordItem
        }
        if (!this._templates) {
            var templatesStr = await this.locate(IConfigsService).getValueOrDefault(ConfigKeys.KEYWORDS_QRERY_TEMPLAES) || ''
            var templates: [string, string][] = templatesStr.split(',').map(s => s.trim()).filter(s => s).map(s => s.split(' ').map(s => s.trim()).filter(s => s)).filter(s => s[0] && s[1]).map(s => [s[0], s[1]])
            this._templates = new Map(templates);
            this._templates.set('article', `${window.location.protocol}//${window.location.host}/#/articles/\${keyword}`)
        }
        const getProto = (): string | undefined => {
            if (!this._templates.size) {
            }
            for (var p of Array.from(keywordItem.searchKeys!.keys())) {
                if (this._templates.has(p)) {
                    return p
                }
            }
            return undefined
        }
        var proto = getProto();
        if (proto) {
            keywordItem.efficialUrl = this._templates.get(proto)!.replace('${keyword}', keywordItem.searchKeys!.get(proto)!);
        } else {
            var url = this._templates.get('default')
            if (url) {
                keywordItem.efficialUrl = url.replace('${keyword}', title);
            } else {
                keywordItem.efficialUrl = 'about://blank'
            }
        }
        return keywordItem;
    }

    keywordFrom(item: KeywordDto) {
        var k = new Keyword();
        k.id = item.getId();
        var url = item.getUrl();
        k.url = url;
        var tokens = url.split(',').map(s => s.trim()).filter(s => s);
        for (var token of tokens) {
            var [proto, path] = token.split('://')
            if (!proto) {
                continue
            }
            proto = proto.toLocaleLowerCase();
            if (proto === 'http' || proto === 'https') {
                k.efficialUrl = token
                continue
            }
            if (proto && path) {
                k.searchKeys = k.searchKeys || new Map();
                k.searchKeys!.set(proto, path);
            }
        }
        k.description = item.getDescription();
        return k;
    }

    async getAll(filter?: string | undefined, skip?: number | undefined, take?: number | undefined): Promise<[number, import("./IKeywordsService").Keyword[]]> {
        var res = await ClientRun(this, () => this.locate(KeywordsServiceClient).getAll(
            new GetAllRequest().setFilter(filter || '').setSkip(skip || 0).setTake(take || 0), null))
        return [res.getTotal(), res.getKeywordsList().map(this.keywordFrom)]
    }
    async add(id: string, url: string, description?: string | undefined): Promise<void> {
        if (this._caches) {
            this._caches = undefined
        }
        await ClientRun(this, () => this.locate(KeywordsServiceClient).add(
            new KeywordDto().setId(id).setUrl(url).setDescription(description || ''), null))
    }
    async updateUrl(id: string, url: string): Promise<void> {
        if (this._caches) {
            this._caches = undefined
        }
        await ClientRun(this, () => this.locate(KeywordsServiceClient).updateUrl(
            new KeywordDto().setId(id).setUrl(url), null))
    }
    async updateDescription(id: string, description?: string | undefined): Promise<void> {
        if (this._caches) {
            this._caches = undefined
        }
        await ClientRun(this, () => this.locate(KeywordsServiceClient).updateDescription(
            new KeywordDto().setId(id).setDescription(description || ''), null))
    }

    async delete(id: string): Promise<void> {
        if (this._caches) {
            this._caches = undefined
        }
        await ClientRun(this, () => this.locate(KeywordsServiceClient).delete(
            new StringId().setId(id), null))
    }
}