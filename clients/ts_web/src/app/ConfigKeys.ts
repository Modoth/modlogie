export class ConfigKeysInterface<T> {
    ALLOW_LOGIN: T = <any>'ALLOW_LOGIN';
    ALLOW_LIKES: T = <any>'ALLOW_LIKES';
    ALLOW_PRINT: T = <any>'ALLOW_PRINT';
    IMPORT_SUBJECTS_AUTOFIX: T = <any>'IMPORT_SUBJECTS_AUTOFIX';
    MAX_FAVORITES_PER_TYPE: T = <any>'MAX_FAVORITES_PER_TYPE';
    MAX_PRINT_COUNT: T = <any>'MAX_PRINT_COUNT';
    PLUGINS: T = <any>'PLUGINS'
    SHADOW_SECTION_PRIVATE: T = <any>'SHADOW_SECTION_PRIVATE';
    WEB_SITE_AVATAR: T = <any>'WEB_SITE_AVATAR';
    WEB_SITE_DESCRIPTION: T = <any>'WEB_SITE_DESCRIPTION';
    WEB_SITE_FOOTER: T = <any>'WEB_SITE_FOOTER';
    WEB_SITE_LOGO_TITLE: T = <any>'WEB_SITE_LOGO_TITLE';
    WEB_SITE_LOGO: T = <any>'WEB_SITE_LOGO';
    WEB_SITE_NAME: T = <any>'WEB_SITE_NAME';
}

export function get_ARTICLE_TAGS(typeName: string) {
    return `${typeName}:ARTICLE_TAGS`
}

export function get_SUB_TYPE_TAG(typeName: string) {
    return `${typeName}:SUB_TYPE_TAG`
}

export function get_ARTICLE_SECTIONS(typeName: string, subTypeName?: string) {
    return subTypeName ? `${typeName}_${subTypeName}:ARTICLE_SECTIONS` : `${typeName}:ARTICLE_SECTIONS`
}

const ConfigKeys = new ConfigKeysInterface<string>();

export default ConfigKeys;