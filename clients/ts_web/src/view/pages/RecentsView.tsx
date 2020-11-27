import './RecentsView.less'
import { ArticleContentType, ArticleType } from '../../pluginbase/IPluginInfo'
import { Carousel } from 'antd'
import { Redirect } from 'react-router-dom'
import { useServicesLocate, useUser } from '../common/Contexts'
import Article, { ArticleAdditionalType } from '../../domain/ServiceInterfaces/Article'
import Button from 'antd/es/button'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect, MouseEventHandler } from 'react'

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
    <div className={classNames('recent-article-wraper')} onClick={goto}>
      <div className="recent-article" >
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
          articleId={props.article.id!}
        ></props.contentType.Viewer>
      </div>
    </div>
  )
}

export default function RecentsView (props: { type: ArticleType }) {
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
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
      ? await locate(ISubjectsService).get(type.rootSubjectId)
      : null
    if (!subject) {
      return
    }
    const subjectId = subject?.path
    let articles: Article[] = []
    let recommendsArticles: Article[] = []
    const articlesService = locate(IArticleService)
    const Query = articlesService.Query()
    const Condition = articlesService.Condition()
    try {
      const query = new Query().setWhere(
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
      const res = await articlesService.query(query, undefined, 0, 5)
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
      const count =
        (await locate(IConfigsService)
          .getValueOrDefaultNumber(ConfigKeys.RECOMMENT_COUNT)) || 0
      if (count) {
        const query = new Query()
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
        const res = await articlesService.query(query, undefined, 0, count)
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
        recommandTitle = await locate(IConfigsService)
          .getValueOrDefault(ConfigKeys.RECOMMENT_TITLE)!
      }
    } catch (e) {
      // ignore
    }
    const s = locate(IArticleAppservice)
    const types = new Map()
    for (const a of articles) {
      types.set(
        a,
        await s.getArticleType(
          locate(IConfigsService),
          type,
          type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined
        )
      )
    }
    for (const a of recommendsArticles) {
      types.set(
        a,
        await s.getArticleType(
          locate(IConfigsService),
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
    <div className={classNames('recents-view', type.pluginName, type.name)}>
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
