import './ArticlePreview.less'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import { useServicesLocator } from '../common/Contexts'
import Article, { ArticleSection } from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ArticlePreview (props: {
  path: string;
  className?: string;
  dataSections?: ArticleSection[];
}) {
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
      const [article, type] = await locator
        .locate(IArticleAppservice)
        .fetchArticleByPath(props.path)
      if (!article || !type) {
        return ret()
      }
      if (props.dataSections && props.dataSections.length) {
        const sections = article.content?.sections
        if (sections) {
          sections.push(...props.dataSections)
        }
      }
      setArticle(article)
      setType(type)
      ret()
    })()
  }, [])
  if (!article || !type || !article.content) {
    return <></>
  }
  return (
    <type.Viewer
      className={classNames('article-preview', props.className)}
      published={article.published}
      showAdditionals={false}
      content={article.content!}
      files={article.files}
      type={type}
    ></type.Viewer>
  )
}
