export class ConfigKeysInterface<T> {
    PLUGINS: T = <any>'PLUGINS'
    WEB_SITE_NAME: T = <any>'WEB_SITE_NAME';
    WEB_SITE_FOOTER: T = <any>'WEB_SITE_FOOTER';
    WEB_SITE_DESCRIPTION: T = <any>'WEB_SITE_DESCRIPTION';
    WEB_SITE_LOGO_TITLE: T = <any>'WEB_SITE_LOGO_TITLE';
    WEB_SITE_LOGO: T = <any>'WEB_SITE_LOGO';
    MAX_PRINT_COUNT: T = <any>'MAX_PRINT_COUNT';
}

export function get_ARTICLE_TAGS(typeName: string) {
    return `${typeName}_ARTICLE_TAGS`
}

export function get_SUB_TYPE_TAG(typeName: string) {
    return `${typeName}_SUB_TYPE_TAG`
}

export function get_ARTICLE_SECTIONS(typeName: string, subTypeName?: string) {
    return subTypeName ? `${typeName}_${subTypeName}_ARTICLE_SECTIONS` : `${typeName}_ARTICLE_SECTIONS`
}

const ConfigKeys = new ConfigKeysInterface<string>();

export default ConfigKeys;