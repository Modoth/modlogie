import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Redirect } from 'react-router-dom'
import { ArticleType, PluginsConfig, ArticleContentType } from '../../plugins/IPluginInfo'
import { useServicesLocator, useUser } from '../../app/Contexts'
import IViewService from '../services/IViewService'
import ISubjectsService from '../../domain/ISubjectsService'
import { Query, Condition } from '../../apis/files_pb'
import IArticleService from '../../domain/IArticleService'
import Article from '../../domain/Article'
import IArticleViewServie from '../services/IArticleViewService'
import IConfigsService from '../../domain/IConfigsSercice'
import classNames from 'classnames'
import "./ArticlePreview.less"

export function ArticlePreview(props: { path: string, className?: string }) {
    const locator = useServicesLocator()
    const [article, setArticle] = useState<Article | undefined>(undefined)
    const [type, setType] = useState<ArticleContentType | undefined>(undefined)
    // const [articleType, setArticleType] = useState<ArticleType | undefined>(undefined)

    useEffect(() => {
        (async () => {
            const viewService = locator.locate(IViewService)
            viewService.setLoading(true)
            var root = props.path.split('/').find(s => s)
            const ret = () => {
                viewService.setLoading(false)
            }
            var rootId = (await locator.locate(ISubjectsService).getByPath('/' + root))?.id
            if (!rootId) {
                return ret()
            }
            var config = locator.locate(PluginsConfig)
            var type = config.AllTypes.find(t => t.rootSubjectId === rootId)
            if (!type) {
                return ret()
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
                        .setValue(props.path)
                ]))
            var res = await locator.locate(IArticleService).query(query, undefined, 0, 1)
            var article = res?.[1]?.[0]
            if (!article) {
                return ret()
            }
            if (article.lazyLoading) {
                await article.lazyLoading()
            }
            var contentType = await locator.locate(IArticleViewServie)
                .getArticleType(locator.locate(IConfigsService), type, type.subTypeTag ? article.tagsDict?.get(type.subTypeTag!)?.value : undefined);
            setArticle(article)
            setType(contentType)
            ret()
        })()
    }, [])
    if (!article || !type || !article.content) {
        return <></>
    }
    return <type.Viewer className={classNames("article-preview", props.className)} published={article.published} showAdditionals={false} content={article.content!} files={article.files} type={type}></type.Viewer>

}