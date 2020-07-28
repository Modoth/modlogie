import ConfigKeys, { ConfigKeysInterface } from "./ConfigKeys";
import { Config, ConfigType } from "../domain/IConfigsSercice";

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
    WEB_SITE_NAME = new Config(ConfigKeys.WEB_SITE_NAME, ConfigType.STRING, "博客");
    WEB_SITE_DESCRIPTION = new Config(ConfigKeys.WEB_SITE_DESCRIPTION, ConfigType.TEXT, "");
    WEB_SITE_FOOTER = new Config(ConfigKeys.WEB_SITE_FOOTER, ConfigType.TEXT, "");
    PLUGINS = new Config(ConfigKeys.PLUGINS, ConfigType.STRING, "");
    WEB_SITE_LOGO_TITLE = new Config(ConfigKeys.WEB_SITE_LOGO_TITLE, ConfigType.RESOURCE, "/配置/标题LOGO");
    WEB_SITE_LOGO = new Config(ConfigKeys.WEB_SITE_LOGO, ConfigType.RESOURCE, "/配置/LOGO");
    MAX_PRINT_COUNT = new Config(ConfigKeys.MAX_PRINT_COUNT, ConfigType.NUMBER, "100");
}

const DefaultConfigs: Config[] = Array.from(Object.values(new DefaultConfigsClass()))

export default DefaultConfigs;