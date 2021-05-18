import './ArticleFolder.less'

import React, { useState, useEffect } from 'react'
import Article from '../../domain/ServiceInterfaces/Article'
import { ArticleContentType, ArticleType, PluginsConfig } from '../../pluginbase/IPluginInfo'
import { useServicesLocate } from '../common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import { Condition } from '../../impl/remote-apis/files_pb'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import { rootname } from '../../infrac/Lang/pathutils'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import { Carousel } from 'antd'

export function ArticleFolder (props: {path: string}) {
  const [type, setType] = useState<ArticleType| undefined>()
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
  const locate = useServicesLocate()
  const fetchArticles = async () => {
    if (!type) {
      return
    }
    const viewService = locate(IViewService)
    viewService.setLoading(true)
    try {
      const articlesService = locate(IArticleService)
      const Query = articlesService.Query()
      const query = new Query()
      query.setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            new Condition()
              .setType(Condition.ConditionType.STARTS_WITH)
              .setProp('Path')
              .setValue(props.path)
          ])
      )
      const [_, articles] = await articlesService.query(query, undefined, 0, 0)
      const all:[Article, ArticleContentType][] = []
      var allTasks = []
      for (const a of articles) {
        const pair : any = [a, undefined]
        all.push(pair)
        if (a.lazyLoading) {
          allTasks.push(a.lazyLoading())
        }
        allTasks.push(locate(IArticleAppservice)
          .getArticleType(locate(IConfigsService), type, type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined)
          .then(t => { pair[1] = t }))
      }
      await Promise.all(allTasks)
      setItems(all)
      viewService.setLoading(false)
    } catch (e) {
      viewService!.errorKey(locate(ILangsService), e.message)
      viewService.setLoading(false)
    }
  }
  const fetchType = async () => {
    const root = '/' + rootname(props.path)
    const rootId = (await locate(ISubjectsService).getByPath(root))?.id
    if (!rootId) {
      return
    }
    const config = locate(PluginsConfig)
    const type = config.AllTypes.find(t => t.rootSubjectId === rootId)
    setType(type)
  }
  useEffect(() => {
    fetchArticles()
  }, [type])
  useEffect(() => {
    fetchType()
  }, [])
  if (!items.length) {
    return <></>
  }
  return <div className="article-folder">
    <Carousel>
      {items.map(([article, t]) => (
        <div key={article.id!} className="article-folder-article">
          <t.Viewer articleId={article.id!} content={article.content!} files={article.files} type={t} />
        </div>
      ))}
    </Carousel>
  </div>
}
