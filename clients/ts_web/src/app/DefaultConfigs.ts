import ConfigKeys, { ConfigKeysInterface } from "./ConfigKeys";
import { Config, ConfigType } from "../domain/IConfigsSercice";

export const UserRoleKeys = {
    UNLOGIN: "UNLOGIN",
    NORMAL: "NORMAL",
    AUTHORISED: "AUTHORISED",
    ADM: "ADM",
}

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
    ALLOW_LOGIN = new Config(ConfigKeys.ALLOW_LOGIN, ConfigType.BOOLEAN, "false");
    ALLOW_PRINT = new Config(ConfigKeys.ALLOW_PRINT, ConfigType.ENUM, UserRoleKeys.UNLOGIN, "", [UserRoleKeys.UNLOGIN, UserRoleKeys.NORMAL, UserRoleKeys.AUTHORISED, UserRoleKeys.ADM]);
    IMPORT_SUBJECTS_AUTOFIX = new Config(ConfigKeys.IMPORT_SUBJECTS_AUTOFIX, ConfigType.BOOLEAN, "false");
    MAX_FAVORITES_PER_TYPE = new Config(ConfigKeys.MAX_FAVORITES_PER_TYPE, ConfigType.NUMBER, "1000");
    MAX_PRINT_COUNT = new Config(ConfigKeys.MAX_PRINT_COUNT, ConfigType.NUMBER, "100");
    PLUGINS = new Config(ConfigKeys.PLUGINS, ConfigType.STRING, "");
    SHADOW_SECTION_PRIVATE = new Config(ConfigKeys.SHADOW_SECTION_PRIVATE, ConfigType.BOOLEAN, "false");
    WEB_SITE_AVATAR = new Config(ConfigKeys.WEB_SITE_AVATAR, ConfigType.RESOURCE, "/配置/AVATAR");
    WEB_SITE_DESCRIPTION = new Config(ConfigKeys.WEB_SITE_DESCRIPTION, ConfigType.TEXT, "");
    WEB_SITE_FOOTER = new Config(ConfigKeys.WEB_SITE_FOOTER, ConfigType.TEXT, "");
    WEB_SITE_LOGO = new Config(ConfigKeys.WEB_SITE_LOGO, ConfigType.RESOURCE, "/配置/LOGO");
    WEB_SITE_LOGO_TITLE = new Config(ConfigKeys.WEB_SITE_LOGO_TITLE, ConfigType.RESOURCE, "/配置/标题LOGO");
    WEB_SITE_NAME = new Config(ConfigKeys.WEB_SITE_NAME, ConfigType.STRING, "博客");
}
const DefaultConfigs: Config[] = Array.from(Object.values(new DefaultConfigsClass()))

export default DefaultConfigs;