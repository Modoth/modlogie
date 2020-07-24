export class ConfigKeysInterface<T> {
    PLUGINS: T = <any>'PLUGINS'
    WEB_SITE_NAME: T = <any>'WEB_SITE_NAME';
    WEB_SITE_FOOTER: T = <any>'WEB_SITE_FOOTER';
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