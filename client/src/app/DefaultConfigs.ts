import ConfigKeys, { ConfigKeysInterface } from "./ConfigKeys";
import { Config, ConfigType } from "../domain/IConfigsSercice";

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
    WEB_SITE_NAME = new Config(ConfigKeys.WEB_SITE_NAME, ConfigType.STRING, "");
    WEB_SITE_FOOTER = new Config(ConfigKeys.WEB_SITE_FOOTER, ConfigType.STRING, "");
    PLUGINS = new Config(ConfigKeys.PLUGINS, ConfigType.STRING, "");
    RECENT_TYPE = new Config(ConfigKeys.RECENT_TYPE, ConfigType.STRING, "");
}

const DefaultConfigs: Config[] = Array.from(Object.values(new DefaultConfigsClass()))

export default DefaultConfigs;