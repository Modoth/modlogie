import React, { useState, useEffect } from 'react'
import { useLocation, Redirect } from 'react-router-dom'
import { useServicesLocator, useUser } from '../../app/Contexts'
import IViewService from '../services/IViewService'
import { fetchArticle } from '../services/IApplicationService'

export function ArticleDetail(props: {}) {
    const param = useLocation<any>()
    const locator = useServicesLocator()
    const path = param.pathname?.slice('/article'.length)
    const [url, setUrl] = useState<any>(undefined)

    useEffect(() => {
        (async () => {
            const viewService = locator.locate(IViewService)
            viewService.setLoading(true)
            const [article, articleContentType, type] = await fetchArticle(locator, path, true) || []
            viewService.setLoading(false)
            const onclose = () => {
                setUrl({ pathname: '/' + (type ? type.route : '') })
            }
            if (!article || !articleContentType) {
                onclose()
                return
            }
            locator.locate(IViewService).previewArticle(article, articleContentType, onclose)
        })()
    }, [])
    if (!url) {
        return <></>
    }
    return <Redirect to={url}></Redirect>
}