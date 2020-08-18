import IKeywordsService, { Keyword } from "./IKeywordsService";
import IServicesLocator from "../common/IServicesLocator";
import IConfigsService from "./IConfigsSercice";
import ConfigKeys from "../app/ConfigKeys";
import { Keyword as KeywordDto, GetAllRequest } from "../apis/keywords_pb";
import { ClientRun } from "../common/GrpcUtils";
import { KeywordsServiceClient } from "../apis/KeywordsServiceClientPb";
import { StringId } from "../apis/messages_pb";

export default class KeywordsService extends IServicesLocator implements IKeywordsService {
    private _caches?: Map<string, Keyword | undefined>;
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
        if (!keywordItem.url) {
            var url = await this.locate(IConfigsService).getValueOrDefault(ConfigKeys.SEARCH_URL)
            if (url) {
                keywordItem.url = url.replace('${keyword}', keyword);
            }
        }
        return keywordItem;
    }

    keywordFrom(item: KeywordDto) {
        var k = new Keyword();
        k.id = item.getId();
        k.url = item.getUrl();
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
        await ClientRun(this, () => this.locate(KeywordsServiceClient).updateUrl(
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