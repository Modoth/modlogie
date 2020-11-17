import { Config, ConfigType } from '../../domain/ServiceInterfaces/IConfigsSercice'
import ConfigKeys, { ConfigKeysInterface } from '../../domain/ServiceInterfaces/ConfigKeys'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

export const UserRoleKeys = {
  UNLOGIN: 'UNLOGIN',
  NORMAL: 'NORMAL',
  AUTHORISED: 'AUTHORISED',
  ADM: 'ADM'
}

class DefaultConfigsClass implements ConfigKeysInterface<Config> {
  ADDITIONAL_STYLE = new Config(ConfigKeys.ADDITIONAL_STYLE, ConfigType.RESOURCE, '/配置/样式');
  ALLOW_LIKES = new Config(ConfigKeys.ALLOW_LIKES, ConfigType.BOOLEAN, 'false');
  ALLOW_LOGIN = new Config(ConfigKeys.ALLOW_LOGIN, ConfigType.BOOLEAN, 'false');
  ALLOW_PRINT = new Config(ConfigKeys.ALLOW_PRINT, ConfigType.ENUM, UserRoleKeys.UNLOGIN, '', [UserRoleKeys.UNLOGIN, UserRoleKeys.NORMAL, UserRoleKeys.AUTHORISED, UserRoleKeys.ADM]);
  EDITOR_TYPES=new Config(ConfigKeys.EDITOR_TYPES, ConfigType.STRING, '');// txt txt;
  EDITORS_PATH=new Config(ConfigKeys.EDITORS_PATH, ConfigType.STRING, '/apps/editors');
  FRAMEWORKS_PATH=new Config(ConfigKeys.FRAMEWORKS_PATH, ConfigType.STRING, '/fw');
  IMPORT_SUBJECTS_AUTOFIX = new Config(ConfigKeys.IMPORT_SUBJECTS_AUTOFIX, ConfigType.BOOLEAN, 'false');
  KEYWORDS_QRERY_TEMPLAES = new Config(ConfigKeys.KEYWORDS_QRERY_TEMPLAES, ConfigType.STRING, `default${Seperators.Fields}https://www.google.com/search?q=\${keyword}`);
  LANGS_SERVER = new Config(ConfigKeys.LANGS_SERVER, ConfigType.STRING, '');// https://www.modoth.cn:8000/$LANG/$CODE,perl,bash
  MAX_FAVORITES_PER_TYPE = new Config(ConfigKeys.MAX_FAVORITES_PER_TYPE, ConfigType.NUMBER, '1000');
  MAX_PRINT_COUNT = new Config(ConfigKeys.MAX_PRINT_COUNT, ConfigType.NUMBER, '100');
  PLUGINS = new Config(ConfigKeys.PLUGINS, ConfigType.STRING, '');
  RECOMMENT_COUNT = new Config(ConfigKeys.RECOMMENT_COUNT, ConfigType.NUMBER, '');
  RECOMMENT_TITLE = new Config(ConfigKeys.RECOMMENT_TITLE, ConfigType.STRING, '推荐');
  SHADOW_SECTION_PRIVATE = new Config(ConfigKeys.SHADOW_SECTION_PRIVATE, ConfigType.BOOLEAN, 'false');
  VIEWER_PATH=new Config(ConfigKeys.VIEWER_PATH, ConfigType.STRING, '/apps/viewers');
  VIEWER_TYPES=new Config(ConfigKeys.VIEWER_TYPES, ConfigType.STRING, '');// txt txt;
  WEB_SITE_AVATAR = new Config(ConfigKeys.WEB_SITE_AVATAR, ConfigType.RESOURCE, '/配置/AVATAR');
  WEB_SITE_DESCRIPTION = new Config(ConfigKeys.WEB_SITE_DESCRIPTION, ConfigType.TEXT, '');
  WEB_SITE_FOOTER = new Config(ConfigKeys.WEB_SITE_FOOTER, ConfigType.TEXT, '');
  WEB_SITE_LOGO = new Config(ConfigKeys.WEB_SITE_LOGO, ConfigType.RESOURCE, '/配置/LOGO');
  WEB_SITE_LOGO_TITLE = new Config(ConfigKeys.WEB_SITE_LOGO_TITLE, ConfigType.RESOURCE, '/配置/标题LOGO');
  WEB_SITE_NAME = new Config(ConfigKeys.WEB_SITE_NAME, ConfigType.STRING, '博客');
}
const DefaultConfigs: Config[] = Array.from(Object.values(new DefaultConfigsClass()))

export default DefaultConfigs
