import { useLocation, Redirect } from 'react-router-dom'
import { useServicesLocator } from '../common/Contexts'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ArticleDetail (props: {}) {
  const param = useLocation<any>()
  const locator = useServicesLocator()
  const path = param.pathname?.slice('/article'.length)
  const [url, setUrl] = useState<any>(undefined)

  useEffect(() => {
    (async () => {
      const viewService = locator.locate(IViewService)
      viewService.setLoading(true)
      const [article, articleContentType, type] =
        (await locator.locate(IArticleAppservice).fetchArticleByPath(path, true)) ||
        []
      viewService.setLoading(false)
      const onclose = () => {
        setUrl({ pathname: '/' + (type ? type.route : '') })
      }
      if (!article || !articleContentType) {
        onclose()
        return
      }
      locator
        .locate(IViewService)
        .previewArticle(article, articleContentType, onclose)
    })()
  }, [])
  if (!url) {
    return <></>
  }
  return <Redirect to={url}></Redirect>
}
