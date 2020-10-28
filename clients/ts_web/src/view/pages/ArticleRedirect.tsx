import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Redirect } from 'react-router-dom'
import { ArticleType, PluginsConfig } from '../../plugins/IPluginInfo'
import { useServicesLocator, useUser } from '../../app/Contexts'
import IViewService from '../services/IViewService'
import ISubjectsService from '../../domain/ISubjectsService'
import { Query, Condition } from '../../apis/files_pb'
import IArticleService from '../../domain/IArticleService'

export function ArticleRedirect(props: {}) {
    const param = useLocation<any>()
    const locator = useServicesLocator()
    const user = useUser()
    const path = param.pathname?.slice('/article'.length)
    const [url, setUrl] = useState<any>(undefined)

    useEffect(() => {
        (async () => {
            const viewService = locator.locate(IViewService)
            viewService.setLoading(true)
            var root = path.split('/').find(s => s)
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
                        .setValue(path)
                ]))
            var res = await locator.locate(IArticleService).query(query, undefined, 0, 1)
            if (!res || !res[1] || !res[1][0] || !res[1][0].id) {
                return ret()
            }
            setUrl({ pathname: '/' + type.route, state: { articleId: res[1][0].id! } })
        })()
    }, [])
    if (!url) {
        return <></>
    }
    return <Redirect to={url}></Redirect>
}