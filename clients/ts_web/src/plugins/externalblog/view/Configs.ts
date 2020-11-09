import { Config, ConfigType } from '../../../domain/ServiceInterfaces/IConfigsSercice'

export class ConfigKeysInterface<T> {
    BASE_ADD: T = <any>'BASE_ADD';
}

export const ConfigKeys = new ConfigKeysInterface<string>()

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
    BASE_ADD = new Config(ConfigKeys.BASE_ADD, ConfigType.STRING, '');
}

export const TypeDefaultConfigs = Array.from(Object.values(new DefaultConfigsClass()))
