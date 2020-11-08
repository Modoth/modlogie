import React, { useState, useEffect, MouseEventHandler } from 'react'
import { useServicesLocator, useUser } from '../Contexts'
import ILangsService, {
  LangKeys
} from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import classNames from 'classnames'
import './RecentsView.less'
import { generateRandomStyle } from './common'
import IPluginInfo, {
  ArticleContentType,
  PluginsConfig,
  ArticleType
} from '../../plugins/IPluginInfo'
import { useHistory, Link, Redirect } from 'react-router-dom'
import Article, {
  ArticleAdditionalType
} from '../../domain/ServiceInterfaces/Article'
import ITagsService, {
  TagNames
} from '../../domain/ServiceInterfaces/ITagsService'
import { Carousel } from 'antd'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import Button from 'antd/es/button'

function RecentArticle (props: {
  article: Article;
  type: ArticleType;
  contentType: ArticleContentType;
  onClick?: MouseEventHandler<any>;
  recommendView?: boolean;
  recommendTitle?: string;
}) {
  const [redirect, setRedirect] = useState(false)
  if (redirect) {
    return (
      <Redirect
        to={{
          pathname: '/article' + props.article.path,
          state: { recommendView: props.recommendView }
        }}
      ></Redirect>
    )
  }
  const goto = () => setRedirect(true)
  return (
    <div className={classNames('recent-article-wraper')}>
      <div className="recent-article" onClick={goto}>
        {(props.recommendView && props.recommendTitle) ||
        !props.type.noTitle ? (
            <span className="article-title">
              {props.recommendView && props.recommendTitle ? (
                <Button className="recommend-button" danger type="link">
                  {props.recommendTitle}
                </Button>
              ) : (
                <span></span>
              )}
              {props.type.noTitle ? null : <div>{props.article.name}</div>}
            </span>
          ) : null}
        <props.contentType.Viewer
          content={props.article.content!}
          files={props.article.files}
          type={props.contentType}
        ></props.contentType.Viewer>
      </div>
    </div>
  )
}

export default function RecentsView (props: { type: ArticleType }) {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [articles, setArticles] = useState<Article[]>([])
  const [recommendsArticles, setRecommendsArticles] = useState<Article[]>([])
  const [recommandTitle, setRecommendTitle] = useState('')
  const [articleTypes, setArticleTypes] = useState(
    new Map<Article, ArticleContentType>()
  )
  const type = props.type
  const user = useUser()

  const fetchArticles = async () => {
    if (!type) {
      return
    }
    const subject = type.rootSubjectId
      ? await locator.locate(ISubjectsService).get(type.rootSubjectId)
      : null
    if (!subject) {
      return
    }
    const subjectId = subject?.path
    let articles: Article[] = []
    let recommendsArticles: Article[] = []
    const articlesService = locator.locate(IArticleService)
    const Query = articlesService.Query()
    const Condition = articlesService.Condition()
    try {
      let query = new Query().setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            ...(subjectId
              ? [
                new Condition()
                  .setType(Condition.ConditionType.STARTS_WITH)
                  .setProp('Path')
                  .setValue(subjectId)
              ]
              : []),
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('AdditionalType')
              .setValue(ArticleAdditionalType.Normal.toString())
          ])
      )
      if (type.orderBy) {
        query.setOrderBy(type.orderBy)
        if (type.orderByDesc) {
          query.setOrderByDesc(true)
        }
      } else {
        query.setOrderBy('Modified').setOrderByDesc(true)
      }
      let res = await articlesService.query(query, undefined, 0, 5)
      articles = res[1]
      await Promise.all(
        articles
          .filter((a) => a.lazyLoading)
          .map((a) => a.lazyLoading!())
          .concat(
            type.loadAdditionalsSync
              ? articles
                .filter((a) => a.lazyLoadingAddition)
                .map((a) => a.lazyLoadingAddition!())
              : []
          )
      )
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
    let recommandTitle = ''
    try {
      let count =
        (await locator
          .locate(IConfigsService)
          .getValueOrDefaultNumber(ConfigKeys.RECOMMENT_COUNT)) || 0
      if (count) {
        let query = new Query()
          .setWhere(
            new Condition()
              .setType(Condition.ConditionType.AND)
              .setChildrenList([
                new Condition()
                  .setType(Condition.ConditionType.EQUAL)
                  .setProp('Type')
                  .setValue('0'),
                ...(subjectId
                  ? [
                    new Condition()
                      .setType(Condition.ConditionType.STARTS_WITH)
                      .setProp('Path')
                      .setValue(subjectId)
                  ]
                  : []),
                new Condition()
                  .setType(Condition.ConditionType.EQUAL)
                  .setProp('AdditionalType')
                  .setValue(ArticleAdditionalType.Recommend.toString())
              ])
          )
          .setOrderBy('Random')
        let res = await articlesService.query(query, undefined, 0, count)
        recommendsArticles = res[1]
        await Promise.all(
          recommendsArticles
            .filter((a) => a.lazyLoading)
            .map((a) => a.lazyLoading!())
            .concat(
              type.loadAdditionalsSync
                ? recommendsArticles
                  .filter((a) => a.lazyLoadingAddition)
                  .map((a) => a.lazyLoadingAddition!())
                : []
            )
        )
        recommandTitle = await locator
          .locate(IConfigsService)
          .getValueOrDefault(ConfigKeys.RECOMMENT_TITLE)!
      }
    } catch (e) {
      // ignore
    }
    const s = locator.locate(IArticleAppservice)
    let types = new Map()
    for (let a of articles) {
      types.set(
        a,
        await s.getArticleType(
          locator.locate(IConfigsService),
          type,
          type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined
        )
      )
    }
    for (let a of recommendsArticles) {
      types.set(
        a,
        await s.getArticleType(
          locator.locate(IConfigsService),
          type,
          type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined
        )
      )
    }
    if (recommandTitle) {
      setRecommendTitle(recommandTitle)
    }
    setArticleTypes(types)
    setArticles(articles)
    setRecommendsArticles(recommendsArticles)
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  if (!articles?.length) {
    return <></>
  }
  return (
    <div className="recents-view">
      {/* <Button type="link" className="title">{langs.get(LangKeys.Latest)}</Button> */}
      <Carousel>
        {recommendsArticles.map((article) => (
          <RecentArticle
            recommendView={true}
            recommendTitle={recommandTitle}
            article={article}
            key={article.id + '_rec'}
            type={type}
            contentType={articleTypes.get(article)!}
          ></RecentArticle>
        ))}
        {articles.map((article) => (
          <RecentArticle
            article={article}
            key={article.id}
            type={type}
            contentType={articleTypes.get(article)!}
          ></RecentArticle>
        ))}
      </Carousel>
    </div>
  )
}
