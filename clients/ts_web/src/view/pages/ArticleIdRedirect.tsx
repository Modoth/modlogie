import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Redirect } from 'react-router-dom'
import { ArticleType, PluginsConfig } from '../../plugins/IPluginInfo'
import { useServicesLocator, useUser } from '../../app/Contexts'
import IViewService from '../services/IViewService'
import ISubjectsService from '../../domain/ISubjectsService'
import { Query, Condition } from '../../apis/files_pb'
import IArticleService from '../../domain/IArticleService'

export function ArticleIdRedirect(props: {}) {
    const param = useParams<any>()
    const locator = useServicesLocator()
    const user = useUser()
    const [url, setUrl] = useState<any>(undefined)

    useEffect(() => {
        (async () => {
            const viewService = locator.locate(IViewService)
            viewService.setLoading(true)
            const ret = () => {
                viewService.setLoading(false)
            }
            const rootId = param.typeId
            const articleId = param.articleId
            if (!rootId) {
                return ret()
            }
            var config = locator.locate(PluginsConfig)
            var type = (user.editingPermission ? config.AllTypes : config.NormalTypes).find(t => t.rootSubjectId === rootId)
            if (!type) {
                return ret()
            }
            setUrl({ pathname: '/' + type.route, state: { articleId } })
        })()
    }, [])
    if (!url) {
        return <></>
    }
    return <Redirect to={url}></Redirect>
}