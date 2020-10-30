import React, { useState, useEffect } from 'react'
import { ArticleContentType } from '../../plugins/IPluginInfo'
import { useServicesLocator } from '../../app/Contexts'
import IViewService from '../services/IViewService'
import Article, { ArticleSection } from '../../domain/Article'
import classNames from 'classnames'
import "./ArticlePreview.less"
import { fetchArticle } from '../services/IApplicationService'

export function ArticlePreview(props: { path: string, className?: string, dataSections?: ArticleSection[] }) {
    const locator = useServicesLocator()
    const [article, setArticle] = useState<Article | undefined>(undefined)
    const [type, setType] = useState<ArticleContentType | undefined>(undefined)
    useEffect(() => {
        (async () => {
            const viewService = locator.locate(IViewService)
            viewService.setLoading(true)
            const ret = () => {
                viewService.setLoading(false)
            }
            const [article, type] = await fetchArticle(locator, props.path)
            if (!article || !type) {
                return ret()
            }
            if (props.dataSections && props.dataSections.length) {
                article.content?.sections?.push(...props.dataSections)
            }
            setArticle(article)
            setType(type)
            ret()
        })()
    }, [])
    if (!article || !type || !article.content) {
        return <></>
    }
    return <type.Viewer className={classNames("article-preview", props.className)} published={article.published} showAdditionals={false} content={article.content!} files={article.files} type={type}></type.Viewer>

}