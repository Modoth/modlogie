export class ConfigKeysInterface<T> {
    ALLOW_LIKES: T = <any>'ALLOW_LIKES';
    ALLOW_LOGIN: T = <any>'ALLOW_LOGIN';
    ALLOW_PRINT: T = <any>'ALLOW_PRINT';
    EDITOR_TYPES:T=<any>'EDITOR_TYPES';
    EDITORS_PATH:T=<any>'EDITORS_PATH';
    FRAMEWORKS_PATH:T=<any>'FRAMEWORKS_PATH';
    IMPORT_SUBJECTS_AUTOFIX: T = <any>'IMPORT_SUBJECTS_AUTOFIX';
    KEYWORDS_QRERY_TEMPLAES: T = <any>'KEYWORDS_QRERY_TEMPLAES';
    LANGS_SERVER: T = <any>'LANGS_SERVER';
    MAX_FAVORITES_PER_TYPE: T = <any>'MAX_FAVORITES_PER_TYPE';
    MAX_PRINT_COUNT: T = <any>'MAX_PRINT_COUNT';
    MAX_RECENT_FILE_SIZE: T = <any>'MAX_RECENT_FILE_SIZE';
    NEW_FILE_DEFAULT_PRIVATE_SHADOW_SECTION: T = <any>'NEW_FILE_DEFAULT_PRIVATE_SHADOW_SECTION';
    NEW_FILE_DEFAULT_PRIVATE: T = <any>'NEW_FILE_DEFAULT_PRIVATE';
    PLUGINS: T = <any>'PLUGINS'
    RECOMMENT_COUNT: T = <any>'RECOMMENT_COUNT';
    RECOMMENT_TITLE: T = <any>'RECOMMENT_TITLE';
    VIEWER_PATH :T=<any>'VIEWER_PATH';
    VIEWER_TYPES:T=<any>'VIEWER_TYPES';
    WEB_SITE_AVATAR: T = <any>'WEB_SITE_AVATAR';
    WEB_SITE_DESCRIPTION: T = <any>'WEB_SITE_DESCRIPTION';
    WEB_SITE_FOOTER: T = <any>'WEB_SITE_FOOTER';
    WEB_SITE_ICON: T = <any>'WEB_SITE_ICON';
    WEB_SITE_LOGO_TITLE: T = <any>'WEB_SITE_LOGO_TITLE';
    WEB_SITE_LOGO: T = <any>'WEB_SITE_LOGO';
    WEB_SITE_NAME: T = <any>'WEB_SITE_NAME';
}

export function getArticleTags (typeName: string) {
  return `${typeName}:ARTICLE_TAGS`
}

export function getSubtypeTag (typeName: string) {
  return `${typeName}:SUB_TYPE_TAG`
}

export function getDisplayName (typeName: string) {
  return `${typeName}:DISPLAY_NAME`
}

export function getArticleSections (typeName: string, subTypeName?: string) {
  return subTypeName ? `${typeName}_${subTypeName}:ARTICLE_SECTIONS` : `${typeName}:ARTICLE_SECTIONS`
}

const ConfigKeys = new ConfigKeysInterface<string>()

export default ConfigKeys
