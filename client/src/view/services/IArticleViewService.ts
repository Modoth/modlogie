import { TagNames } from "../../domain/ITagsService"
import { ArticleContentType } from "../../plugins/IPluginInfo"
import IConfigsService from "../../domain/IConfigsSercice";
import ConfigKeys, { get_ARTICLE_SECTIONS } from "../../app/ConfigKeys";
type NodeTag = any;
export default class IArticleViewServie {
    public getArticleType(configsService: IConfigsService, viewer: any, typeName: string, subTypeName?: string): Promise<ArticleContentType> {
        throw new Error("Method not implemented.")
    }
}

export class ArticleViewServieSingleton implements IArticleViewServie {
    private typesCaches = new Map<string, any>()

    public async getArticleType(configsService: IConfigsService, viewer: any, typeName: string, subTypeName?: string): Promise<ArticleContentType> {
        var key = subTypeName ? `${typeName}_${subTypeName}` : typeName;
        if (this.typesCaches.has(key)) {
            return this.typesCaches.get(key)
        }
        let parentType = subTypeName ? await this.getArticleType(configsService, viewer, typeName) : { hidenSections: new Set<string>(), allSections: new Set<string>() };
        let type: ArticleContentType = Object.assign({}, parentType, { Viewer: viewer, name: typeName })

        var allsections = (await configsService.getValuesOrDefault(get_ARTICLE_SECTIONS(typeName, subTypeName)))
        if (allsections.length) {
            type.allSections = new Set();
            type.hidenSections = new Set();
            for (let s of allsections) {
                if (s.startsWith(TagNames.HidenSectionPrefix)) {
                    s = s.slice(TagNames.HidenSectionPrefix.length)
                    type.hidenSections.add(s)
                }
                type.allSections.add(s)
            }
        }
        this.typesCaches.set(key, type)
        return type
    }
}