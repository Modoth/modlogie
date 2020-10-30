import { Query, Condition } from "../../apis/files_pb"
import IServicesLocator from "../../common/IServicesLocator"
import Article from "../../domain/Article"
import IArticleService from "../../domain/IArticleService"
import IConfigsService from "../../domain/IConfigsSercice"
import ISubjectsService from "../../domain/ISubjectsService"
import { ArticleContentType, ArticleType, PluginsConfig } from "../../plugins/IPluginInfo"
import IArticleViewServie from "./IArticleViewService"

export async function fetchArticle(locator: IServicesLocator, path: string, loadingAddition = false): Promise<[Article | undefined, ArticleContentType | undefined, ArticleType | undefined]> {
    var root = path.split('/').find(s => s)
    var rootId = (await locator.locate(ISubjectsService).getByPath('/' + root))?.id
    if (!rootId) {
        return [undefined, undefined, undefined]
    }
    var config = locator.locate(PluginsConfig)
    var type = config.AllTypes.find(t => t.rootSubjectId === rootId)
    if (!type) {
        [undefined, undefined, undefined]
    }
    var query = new Query();
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
    var res = await locator.locate(IArticleService).query(query, undefined, 0, 1)
    var article = res?.[1]?.[0]
    if (!article) {
        return [undefined, undefined, type]
    }
    if (article.lazyLoading) {
        await article.lazyLoading()
    }
    if (article.lazyLoadingAddition && loadingAddition) {
        await article.lazyLoadingAddition!();
    }

    var contentType = await locator.locate(IArticleViewServie)
        .getArticleType(locator.locate(IConfigsService), type!, type!.subTypeTag ? article.tagsDict?.get(type!.subTypeTag!)?.value : undefined);
    return [article, contentType, type]
}