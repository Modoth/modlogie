import ConfigKeys, { ConfigKeysInterface } from "./ConfigKeys";
import { Config, ConfigType } from "../domain/IConfigsSercice";

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
    WEB_SITE_NAME = new Config(ConfigKeys.WEB_SITE_NAME, ConfigType.STRING, "博客");
    WEB_SITE_DESCRIPTION = new Config(ConfigKeys.WEB_SITE_DESCRIPTION, ConfigType.TEXT, "");
    WEB_SITE_FOOTER = new Config(ConfigKeys.WEB_SITE_FOOTER, ConfigType.TEXT, "");
    PLUGINS = new Config(ConfigKeys.PLUGINS, ConfigType.STRING, "");
}

const DefaultConfigs: Config[] = Array.from(Object.values(new DefaultConfigsClass()))

export default DefaultConfigs;