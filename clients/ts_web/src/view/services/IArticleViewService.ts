import { TagNames } from "../../domain/ITagsService"
import { ArticleContentType, ArticleType } from "../../plugins/IPluginInfo"
import IConfigsService from "../../domain/IConfigsSercice";
import ConfigKeys, { get_ARTICLE_SECTIONS } from "../../app/ConfigKeys";
type NodeTag = any;
export default class IArticleViewServie {
    public getArticleType(configsService: IConfigsService, articleType: ArticleType, subTypeName?: string): Promise<ArticleContentType> {
        throw new Error("Method not implemented.")
    }
}

export class ArticleViewServieSingleton implements IArticleViewServie {
    private typesCaches = new Map<string, any>()

    public async getArticleType(configsService: IConfigsService, articleType: ArticleType, subTypeName?: string): Promise<ArticleContentType> {
        var typeName = articleType.name;
        var key = subTypeName ? `${typeName}_${subTypeName}` : typeName;
        if (this.typesCaches.has(key)) {
            return this.typesCaches.get(key)
        }
        let parentType = subTypeName ? await this.getArticleType(configsService, articleType) : { smartHiddenSections: new Set<string>(), hiddenSections: new Set<string>(), additionalSections: new Set<string>(), allSections: new Set<string>() };
        let type: ArticleContentType = Object.assign({}, parentType, { noTitle: articleType.noTitle, articleType, Viewer: articleType.Viewer, name: typeName })

        var allsections = (await configsService.getValuesOrDefault(get_ARTICLE_SECTIONS(typeName, subTypeName)))
        if (allsections.length) {
            type.allSections = new Set();
            type.additionalSections = new Set();
            type.hiddenSections = new Set();
            type.smartHiddenSections = new Set();
            for (let s of allsections) {
                if (s.startsWith(TagNames.AdditionalSectionPrefix)) {
                    s = s.slice(TagNames.AdditionalSectionPrefix.length)
                    type.additionalSections.add(s)
                }
                if (s.startsWith(TagNames.HiddenSectionPrefix)) {
                    s = s.slice(TagNames.HiddenSectionPrefix.length)
                    type.hiddenSections.add(s)
                }
                if (s.startsWith(TagNames.SmartHiddenSectionPrefix)) {
                    s = s.slice(TagNames.SmartHiddenSectionPrefix.length)
                    type.smartHiddenSections.add(s)
                }
                type.allSections.add(s)
            }
        }
        this.typesCaches.set(key, type)
        return type
    }
}