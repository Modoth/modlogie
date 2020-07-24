import React, { useState, useEffect, MouseEventHandler } from 'react'
import { useServicesLocator } from '../../app/Contexts'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import classNames from 'classnames'
import './RecentsView.less'
import { generateRandomStyle } from './common'
import IPluginInfo, { ArticleContentType, PluginsConfig, ArticleType } from '../../plugins/IPluginInfo'
import { useHistory } from 'react-router-dom'
import Article from '../../domain/Article'
import ITagsService, { TagNames } from '../../domain/ITagsService'
import { Carousel } from 'antd'
import IArticleViewServie from '../services/IArticleViewService'
import IArticleService from '../../domain/IArticleService'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'

function RecentArticle(props: { article: Article, type: ArticleContentType, onClick?: MouseEventHandler<any>; }) {
  return (
    <div className={classNames(generateRandomStyle(), "recent-article-wraper")}>
      <div className="recent-article">
        <props.type.Viewer onClick={props.onClick} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
      </div>
    </div>
  )
}

export default function RecentsView() {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [articles, setArticles] = useState<Article[]>([])
  const [articleTypes, setArticleTypes] = useState(new Map<Article, ArticleContentType>())
  const [type, setType] = useState<ArticleType | undefined>();

  const fetchArticles = async (page?: number) => {
    if (!type) {
      return
    }
    const api = locator.locate(IArticleService)
    var articles = []
    try {
      var _
      [_, articles] = (await api.all('',
        0,
        5
      ));
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return false
    }
    const s = locator.locate(IArticleViewServie)
    var types = new Map();
    for (var a of articles) {
      types.set(a, await s.getArticleType(locator.locate(IConfigsService), type.Viewer, type.name, type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined))
    }
    setArticleTypes(types)
    setArticles(articles)
  }

  const fetchType = async () => {
    var recentType = await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.RECENT_TYPE);
    if (!recentType) {
      return;
    }
    const type = locator.locate(PluginsConfig).Plugins.flatMap(p => p.types).find(t => t.name == recentType);
    setType(type);
  }

  useEffect(() => {
    fetchArticles()
  }, [type])

  useEffect(() => {
    fetchType()
  }, [])

  if (!type) {
    return <></>
  }
  return (
    <div className="recents-view">
      <div className="title">{langs.get(LangKeys.Latest)}</div>
      <Carousel>
        {
          articles.map(article => <RecentArticle article={article} key={article.id} type={articleTypes.get(article)!} onClick={() => {
            locator.locate(IViewService).previewArticle(article, articleTypes.get(article)!)
          }}></RecentArticle>)
        }
      </Carousel>
    </div>

  )
}
