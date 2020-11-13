import { Keyword as KeywordDto, GetAllRequest } from '../remote-apis/keywords_pb'
import { KeywordsServiceClient } from '../remote-apis/KeywordsServiceClientPb'
import { StringId } from '../remote-apis/messages_pb'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IKeywordsService, { Keyword } from '../../domain/ServiceInterfaces/IKeywordsService'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

export default class KeywordsService extends IServicesLocator implements IKeywordsService {
    private _caches?: Map<string, Keyword | undefined>;
    private _templates: Map<string, string>
    private loaded = false;
    async get (keyword: string): Promise<Keyword> {
      if (!this._caches) {
        this._caches = new Map()
      }
      if (!this._caches!.has(keyword)) {
        try {
          const dto = (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).get(
            new StringId().setId(keyword), null))).getKeyword()
                this._caches!.set(keyword, dto && this.keywordFrom(dto))
        } catch {
          // ignore
        }
      }
      const keywordItem: Keyword = this._caches!.get(keyword) || { id: keyword, url: '' }
      if (keywordItem.efficialUrl) {
        return keywordItem
      }

      if (!this._templates) {
        const templates: [string, string][] = await this.locate(IConfigsService).getFieldsOrDefault(ConfigKeys.KEYWORDS_QRERY_TEMPLAES) as any
        this._templates = new Map(templates)
        this._templates.set('article', `${window.location.protocol}//${window.location.host}/#/article/\${keyword}`)
      }
      const getProto = (): string | undefined => {
        if (!this._templates.size || !keywordItem.searchKeys || !keywordItem.searchKeys.size) {
          return undefined
        }
        for (const p of Array.from(keywordItem.searchKeys!.keys())) {
          if (this._templates.has(p)) {
            return p
          }
        }
        return undefined
      }
      const proto = getProto()
      if (proto) {
        // eslint-disable-next-line no-template-curly-in-string
        keywordItem.efficialUrl = this._templates.get(proto)!.replace('${keyword}', keywordItem.searchKeys!.get(proto)!)
      } else {
        const url = this._templates.get('default')
        if (url) {
          // eslint-disable-next-line no-template-curly-in-string
          keywordItem.efficialUrl = url.replace('${keyword}', keyword)
        } else {
          keywordItem.efficialUrl = 'about://blank'
        }
      }
      return keywordItem
    }

    keywordFrom (item: KeywordDto) {
      const k = new Keyword()
      k.id = item.getId()
      const url = item.getUrl()
      k.url = url
      const tokens = Seperators.seperateItems(url)
      for (const token of tokens) {
        let [proto, path] = token.split('://')
        if (!proto) {
          continue
        }
        proto = proto.toLocaleLowerCase()
        if (proto === 'http' || proto === 'https') {
          k.efficialUrl = token
          continue
        }
        if (proto && path) {
          k.searchKeys = k.searchKeys || new Map()
                k.searchKeys!.set(proto, path)
        }
      }
      k.description = item.getDescription()
      return k
    }

    async getAll (filter?: string | undefined, skip?: number | undefined, take?: number | undefined): Promise<[number, import('../../domain/ServiceInterfaces/IKeywordsService').Keyword[]]> {
      const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).getAll(
        new GetAllRequest().setFilter(filter || '').setSkip(skip || 0).setTake(take || 0), null))
      return [res.getTotal(), res.getKeywordsList().map(this.keywordFrom)]
    }

    async add (id: string, url: string, description?: string | undefined): Promise<void> {
      if (this._caches) {
        this._caches = undefined
      }
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).add(
        new KeywordDto().setId(id).setUrl(url).setDescription(description || ''), null))
    }

    async updateUrl (id: string, url: string): Promise<void> {
      if (this._caches) {
        this._caches = undefined
      }
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).updateUrl(
        new KeywordDto().setId(id).setUrl(url), null))
    }

    async updateDescription (id: string, description?: string | undefined): Promise<void> {
      if (this._caches) {
        this._caches = undefined
      }
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).updateDescription(
        new KeywordDto().setId(id).setDescription(description || ''), null))
    }

    async delete (id: string): Promise<void> {
      if (this._caches) {
        this._caches = undefined
      }
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeywordsServiceClient).delete(
        new StringId().setId(id), null))
    }
}
