import { useLocation, Redirect } from 'react-router-dom'
import { useServicesLocate } from '../common/Contexts'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ArticleDetail (props: {}) {
  const param = useLocation<any>()
  const locate = useServicesLocate()
  const path = param.pathname?.slice('/article'.length)
  const [url, setUrl] = useState<any>(undefined)

  useEffect(() => {
    (async () => {
      const viewService = locate(IViewService)
      viewService.setLoading(true)
      const [article, articleContentType, type] =
        (await locate(IArticleAppservice).fetchArticle(path, true)) ||
        []
      viewService.setLoading(false)
      const onclose = () => {
        setUrl({ pathname: '/' + (type ? type.route : '') })
      }
      if (!article || !articleContentType) {
        onclose()
        return
      }
      locate(IViewService)
        .previewArticle(article, articleContentType, onclose)
    })()
  }, [path])
  if (!url) {
    return <></>
  }
  return <Redirect to={url}></Redirect>
}
