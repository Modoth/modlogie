import { ArticleContentType, ArticleType, PluginsConfig } from '../../plugins/IPluginInfo'
import { getArticleSections } from '../../domain/ServiceInterfaces/ConfigKeys'
import { TagNames } from '../../domain/ServiceInterfaces/ITagsService'
import Article from '../../domain/ServiceInterfaces/Article'
import IArticleAppservice from '../Interfaces/IArticleAppservice'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'

export default class AppArticleServiceSingleton extends IServicesLocator implements IArticleAppservice {
    private typesCaches = new Map<string, any>()

    async getArticleType (configsService: IConfigsService, articleType: ArticleType, subTypeName?: string): Promise<ArticleContentType> {
      let typeName = articleType.name
      let key = subTypeName ? `${typeName}_${subTypeName}` : typeName
      if (this.typesCaches.has(key)) {
        return this.typesCaches.get(key)
      }
      const parentType = subTypeName ? await this.getArticleType(configsService, articleType) : { smartHiddenSections: new Set<string>(), hiddenSections: new Set<string>(), additionalSections: new Set<string>(), allSections: new Set<string>() }
      const type: ArticleContentType = Object.assign({}, parentType, { noTitle: articleType.noTitle, articleType, Viewer: articleType.Viewer, name: typeName })
      let allsections = articleType.fixedSections ? (articleType.defaultSections?.split(' ').map(s => s.trim()).filter(s => s) || []) : (await configsService.getValuesOrDefault(getArticleSections(typeName, subTypeName)))
      if (allsections.length) {
        type.allSections = new Set()
        type.additionalSections = new Set()
        type.hiddenSections = new Set()
        type.smartHiddenSections = new Set()
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

    async fetchArticleByPath (path: string, loadingAddition = false): Promise<[Article | undefined, ArticleContentType | undefined, ArticleType | undefined]> {
      let root = path.split('/').find(s => s)
      let rootId = (await this.locate(ISubjectsService).getByPath('/' + root))?.id
      if (!rootId) {
        return [undefined, undefined, undefined]
      }
      let config = this.locate(PluginsConfig)
      let type = config.AllTypes.find(t => t.rootSubjectId === rootId)
      if (!type) {
        return [undefined, undefined, undefined]
      }
      const articlesService = this.locate(IArticleService)
      const Query = articlesService.Query()
      const Condition = articlesService.Condition()
      let query = new Query()
      query.setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Path')
            .setValue(path)
        ]))
      let res = await articlesService.query(query, undefined, 0, 1)
      let article = res?.[1]?.[0]
      if (!article) {
        return [undefined, undefined, type]
      }
      if (article.lazyLoading) {
        await article.lazyLoading()
      }
      if (article.lazyLoadingAddition && loadingAddition) {
        await article.lazyLoadingAddition!()
      }

      let contentType = await this.locate(IArticleAppservice)
        .getArticleType(this.locate(IConfigsService), type!, type!.subTypeTag ? article.tagsDict?.get(type!.subTypeTag!)?.value : undefined)
      return [article, contentType, type]
    }
}
