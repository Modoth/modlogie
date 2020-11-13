import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { KeyValue } from '../remote-apis/keyvalues_pb'
import { KeyValuesServiceClient } from '../remote-apis/KeyvaluesServiceClientPb'
import { StringId } from '../remote-apis/messages_pb'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsSercice, { Config, ConfigType, ConfigNames } from '../../domain/ServiceInterfaces/IConfigsSercice'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import ITagsService, { TagNames, TagType } from '../../domain/ServiceInterfaces/ITagsService'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

export class ConfigsServiceSingleton extends IServicesLocator implements IConfigsSercice {
    private configs: Map<string, Config>
    private cached = false;
    private defaultConfigs: Config[]
    private defaultServerConfigs: Config[] | undefined
    private customConfigs?: Map<string, string>;
    private includeServerConfigs = false;
    constructor (...defaultConfigs: Config[][]) {
      super()
      this.defaultConfigs = defaultConfigs.flat()
      this.clearCache()
    }

    async addDefaultConfigs (...configs: Config[]): Promise<void> {
      await this.loadCache()
      this.defaultConfigs.push(...configs)
      this.clearCache(true)
      await this.loadCache()
    }

    async getValueOrDefault (key: string): Promise<string> {
      const config = await this.get(key)
      if (!config) {
        return ''
      }
      return config.value || config.defaultValue || ''
    }

    async getValueOrDefaultBoolean (key: string): Promise<boolean> {
      return await this.getValueOrDefault(key) === 'true'
    }

    async getValueOrDefaultNumber (key: string): Promise<number> {
      return parseInt(await this.getValueOrDefault(key))
    }

    async getValuesOrDefault (key: string): Promise<string[]> {
      const value = await this.getValueOrDefault(key)
      if (!value) {
        return []
      }
      return Seperators.seperateItems(value)
    }

    async getFieldsOrDefault (key: string): Promise<string[][]> {
      const values = await this.getValuesOrDefault(key)
      return values.map(value => Seperators.seperateFields(value))
    }

    private cloneConfig (config: Config): Config {
      return Object.assign({}, config)
    }

    private async loadCache (): Promise<void> {
      if (this.cached) {
        return
      }
      this.customConfigs = this.customConfigs || new Map((await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeyValuesServiceClient).getAll(new Empty(), null))).getKeyValuesList().map(c => [c.getId(), c.getValue()]))
        this.customConfigs!.forEach((value, key) => {
          const config = this.configs.get(key)
          if (config) {
            config.value = value
          }
        })

        this.cached = true
    }

    async all (includeServerConfig?: boolean): Promise<Config[]> {
      this.includeServerConfigs = includeServerConfig === true
      if (this.includeServerConfigs && this.defaultServerConfigs === undefined) {
        this.defaultServerConfigs = await (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeyValuesServiceClient).getAllServerKeys(new Empty(), null))).getKeysList().map(k => new Config(k.getKey(), ConfigType.STRING))
        this.clearCache(true)
      }
      await this.loadCache()
      return Array.from(this.configs.values(), this.cloneConfig)
    }

    async get (key: string): Promise<Config | undefined> {
      await this.loadCache()
      const config = this.configs.get(key)
      if (!config) {
        return
      }
      return this.cloneConfig(config)
    }

    async getResource (key: string): Promise<string | undefined> {
      await this.loadCache()

      const path = await this.getValueOrDefault(key)
      if (!path) {
        return
      }
      const resourceFile = await this.locate(ISubjectsService).getByPath(path)
      return resourceFile?.resourceUrl
    }

    async set (key: string, value: string): Promise<Config | undefined> {
      await this.loadCache()

      const config = this.configs.get(key)
      if (!config) {
        return
      }
      const req = new KeyValue()
      req.setId(key)
      req.setValue(value)
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeyValuesServiceClient).addOrUpdate(req, null))
      config.value = value
      if (this.customConfigs) {
        this.customConfigs.set(key, value)
      }
      if (key === ConfigKeys.ALLOW_LIKES) {
        const tags = [TagNames.LIKE_TAG_NAME, TagNames.DISLIKE_TAG_NAME]
        const tagsDict = new Set(tags)
        let values = await this.getValuesOrDefault(ConfigNames.INCREASABLE_TAGS)
        values = values.filter(v => !tagsDict.has(v))
        if (value === 'true') {
          values.push(...tags)
          const tagServer = this.locate(ITagsService)
          for (const tagName of tags) {
            const tag = await tagServer.get(tagName)
            if (!tag) {
              await tagServer.add(tagName, TagType.NUMBER)
            }
          }
        }
        await this.set(ConfigNames.INCREASABLE_TAGS, Seperators.joinItems(values))
      }
      return this.cloneConfig(config)
    }

    async reset (key: string): Promise<Config | undefined> {
      await this.loadCache()
      const config = this.configs.get(key)
      if (!config) {
        return
      }
      const req = new StringId()
      req.setId(key)
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeyValuesServiceClient).delete(req, null))
      config.value = undefined
      if (this.customConfigs) {
        this.customConfigs.delete(key)
      }
      return this.cloneConfig(config)
    }

    async resetAll (): Promise<void> {
      await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(KeyValuesServiceClient).deleteAll(new Empty(), null))
      this.clearCache()
    }

    clearCache (keepRemoteCache = false) {
      this.configs = new Map(this.defaultConfigs.concat(this.includeServerConfigs && this.defaultServerConfigs ? this.defaultServerConfigs! : []).map(c => [c.key, c]))
      if (!keepRemoteCache) {
        this.customConfigs = undefined
        this.includeServerConfigs = false
        this.defaultServerConfigs = undefined
      }
      this.cached = false
    }
}
