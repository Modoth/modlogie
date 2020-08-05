import React, { useState, useEffect, MouseEventHandler } from 'react'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import classNames from 'classnames'
import './RecentsView.less'
import { generateRandomStyle } from './common'
import IPluginInfo, { ArticleContentType, PluginsConfig, ArticleType } from '../../plugins/IPluginInfo'
import { useHistory, Link } from 'react-router-dom'
import Article from '../../domain/Article'
import ITagsService, { TagNames } from '../../domain/ITagsService'
import { Carousel } from 'antd'
import IArticleViewServie from '../services/IArticleViewService'
import IArticleService from '../../domain/IArticleService'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'
import { Query, Condition } from '../../apis/files_pb'
import ISubjectsService from '../../domain/ISubjectsService'

function RecentArticle(props: { article: Article, type: ArticleType, contentType: ArticleContentType, onClick?: MouseEventHandler<any>; }) {
  return (
    <div className={classNames("recent-article-wraper")}>
      <Link className="recent-article" to={{ pathname: '/' + props.type.route, state: { articleId: props.article.id } }}>
        <props.contentType.Viewer content={props.article.content!} files={props.article.files} type={props.contentType}></props.contentType.Viewer>
      </Link>
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
  const user = useUser();

  const fetchArticles = async () => {
    if (!type) {
      return
    }
    const subject = type.rootSubject ? (await locator.locate(ISubjectsService).all(type.rootSubject))?.[0] : null;
    if (!subject) {
      return
    }
    const subjectId = subject?.path;
    var articles: Article[] = []
    try {
      var query = new Query()
        .setWhere(new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition().setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            ...(subjectId ? [new Condition().setType(Condition.ConditionType.STARTS_WITH)
              .setProp('Path').setValue(subjectId)] : [])
          ])
        )
      var res = await locator.locate(IArticleService).query(query, undefined, 0, 5);
      articles = res[1];
      await Promise.all(articles.filter(a => a.lazyLoading).map(a => a.lazyLoading!()))
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return false
    }
    const s = locator.locate(IArticleViewServie)
    var types = new Map();
    for (var a of articles) {
      types.set(a, await s.getArticleType(locator.locate(IConfigsService), type, type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined))
    }
    setArticleTypes(types)
    setArticles(articles)
  }

  const fetchType = async () => {
    const type = locator.locate(PluginsConfig).Plugins.flatMap(p => p.types).filter(p => user || !p.hiddenFromMenu)[0];
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
          articles.map(article => <RecentArticle article={article} key={article.id} type={type} contentType={articleTypes.get(article)!} onClick={() => {
            locator.locate(IViewService).previewArticle(article, articleTypes.get(article)!)
          }}></RecentArticle>)
        }
      </Carousel>
    </div>

  )
}
