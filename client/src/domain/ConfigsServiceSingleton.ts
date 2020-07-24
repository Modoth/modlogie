import IConfigsSercice, { Config } from "./IConfigsSercice";
import { KeyValuesServiceClient } from "../apis/KeyvaluesServiceClientPb";
import IServicesLocator from "../common/IServicesLocator";
import { ClientRun } from "../common/GrpcUtils";
import { Empty } from "google-protobuf/google/protobuf/empty_pb";
import { KeyValue } from "../apis/keyvalues_pb";
import { StringId } from "../apis/messages_pb";

export class ConfigsServiceSingleton extends IServicesLocator implements IConfigsSercice {
    private configs: Map<string, Config>
    private cached = false;
    private defaultConfigs: Config[]
    private customConfigs?: Map<string, string>;
    constructor(...defaultConfigs: Config[][]) {
        super()
        this.defaultConfigs = defaultConfigs.flat();
        this.clearCache();
    }

    async addDefaultConfigs(...configs: Config[]): Promise<void> {
        await this.loadCache();
        this.defaultConfigs.push(...configs)
        this.clearCache(true);
        await this.loadCache();
    }

    async getValueOrDefault(key: string): Promise<string> {
        var config = await this.get(key);
        if (!config) {
            return '';
        }
        return config.value || config.defaultValue || '';
    }

    async getValuesOrDefault(key: string): Promise<string[]> {
        var value = await this.getValueOrDefault(key);
        if (!value) {
            return [];
        }
        return value.split(' ').map(s => s.trim()).filter(s => s);
    }

    private cloneConfig(config: Config): Config {
        return Object.assign({}, config);
    }

    private async loadCache(): Promise<void> {
        if (this.cached) {
            return
        }
        this.customConfigs = this.customConfigs || new Map((await ClientRun(() => this.locate(KeyValuesServiceClient).getAll(new Empty(), null))).getKeyValuesList().map(c => [c.getId(), c.getValue()]))
        this.customConfigs!.forEach((value, key) => {
            var config = this.configs.get(key);
            if (config) {
                config.value = value;
            }
        })

        this.cached = true;
    }

    async all(): Promise<Config[]> {
        await this.loadCache();
        return Array.from(this.configs.values(), this.cloneConfig);
    }

    async get(key: string): Promise<Config | undefined> {
        await this.loadCache();

        var config = this.configs.get(key);
        if (!config) {
            return
        }
        return this.cloneConfig(config);
    }

    async set(key: string, value: string): Promise<Config | undefined> {
        await this.loadCache();

        var config = this.configs.get(key);
        if (!config) {
            return
        }
        var req = new KeyValue();
        req.setId(key);
        req.setValue(value);
        await ClientRun(() => this.locate(KeyValuesServiceClient).addOrUpdate(req, null))
        config.value = value;
        this.customConfigs?.set(key, value);
        return this.cloneConfig(config);
    }

    async reset(key: string): Promise<Config | undefined> {
        await this.loadCache();

        var config = this.configs.get(key);
        if (!config) {
            return
        }
        var req = new StringId();
        req.setId(key);
        await ClientRun(() => this.locate(KeyValuesServiceClient).delete(req, null))
        config.value = undefined;
        this.customConfigs?.delete(key);
        return this.cloneConfig(config);
    }

    clearCache(keepRemoteCache = false) {
        this.configs = new Map(this.defaultConfigs.map(c => [c.key, c]))
        if (!keepRemoteCache) {
            this.customConfigs = undefined;
        }
        this.cached = false;
    }
}