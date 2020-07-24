export enum ConfigType {
    STRING = 0,
    ENUM,
    NUMBER,
    BOOLEAN,
    ARTICLE,
    RESOURCE
}

export class Config {
    constructor(public key: string, public type: ConfigType, public defaultValue?: string, public value?: string, public values?: string[]) { }
}

export default class IConfigsService {
    all(): Promise<Array<Config>> {
        throw new Error('Method not implemented')
    }

    addDefaultConfigs(...configs: Config[]): Promise<void> {
        throw new Error('Method not implemented')
    }

    get(key: string): Promise<Config | undefined> {
        throw new Error('Method not implemented')
    }

    getValueOrDefault(key: string): Promise<string> {
        throw new Error('Method not implemented')
    }

    getValuesOrDefault(key: string): Promise<string[]> {
        throw new Error('Method not implemented')
    }

    set(key: string, value: string): Promise<Config | undefined> {
        throw new Error('Method not implemented')
    }

    reset(key: string): Promise<Config | undefined> {
        throw new Error('Method not implemented')
    }

    clearCache() {
        throw new Error("Method not implemented.")
    }
}