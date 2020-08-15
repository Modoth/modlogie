import React, { useState, useEffect, MouseEventHandler } from 'react'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import IViewService from '../services/IViewService'
import classNames from 'classnames'
import './RecentsView.less'
import { generateRandomStyle } from './common'
import IPluginInfo, { ArticleContentType, PluginsConfig, ArticleType } from '../../plugins/IPluginInfo'
import { useHistory, Link, Redirect } from 'react-router-dom'
import Article, { ArticleAdditionalType } from '../../domain/Article'
import ITagsService, { TagNames } from '../../domain/ITagsService'
import { Carousel } from 'antd'
import IArticleViewServie from '../services/IArticleViewService'
import IArticleService from '../../domain/IArticleService'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'
import { Query, Condition } from '../../apis/files_pb'
import ISubjectsService from '../../domain/ISubjectsService'
import Button from 'antd/es/button'

function RecentArticle(props: { article: Article, type: ArticleType, contentType: ArticleContentType, onClick?: MouseEventHandler<any>; recommendView?: boolean, recommendTitle?: string }) {
  const [redirect, setRedirect] = useState(false)
  if (redirect) {
    return <Redirect to={{ pathname: '/' + props.type.route, state: { articleId: props.article.id, recommendView: props.recommendView } }}></Redirect>
  }
  const goto = () => setRedirect(true)
  return (
    <div className={classNames("recent-article-wraper")}>
      <div className="recent-article" onClick={goto}>
        {
          ((props.recommendView && props.recommendTitle) || !props.type.noTitle) ?
            <div className="article-title">
              {props.recommendView && props.recommendTitle ? <Button className="recommend-button" danger type="link" >{props.recommendTitle}</Button> : <span></span>
              }{props.type.noTitle ? null : <div>{props.article.name}</div>}
            </div>
            : null
        }
        <props.contentType.Viewer content={props.article.content!} files={props.article.files} type={props.contentType}></props.contentType.Viewer>
      </div>
    </div>
  )
}

export default function RecentsView() {
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const [articles, setArticles] = useState<Article[]>([])
  const [recommendsArticles, setRecommendsArticles] = useState<Article[]>([])
  const [recommandTitle, setRecommendTitle] = useState('')
  const [articleTypes, setArticleTypes] = useState(new Map<Article, ArticleContentType>())
  const [type, setType] = useState<ArticleType | undefined>();
  const user = useUser();

  const fetchArticles = async () => {
    if (!type) {
      return
    }
    const subject = type.rootSubjectId ? (await locator.locate(ISubjectsService).get(type.rootSubjectId)) : null;
    if (!subject) {
      return
    }
    const subjectId = subject?.path;
    var articles: Article[] = []
    var recommendsArticles: Article[] = []
    try {
      var query = new Query()
        .setWhere(new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition().setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            ...(subjectId ? [new Condition().setType(Condition.ConditionType.STARTS_WITH)
              .setProp('Path').setValue(subjectId)] : []),
            new Condition().setType(Condition.ConditionType.EQUAL)
              .setProp('AdditionalType')
              .setValue(ArticleAdditionalType.Normal.toString())
          ])
        )
      var res = await locator.locate(IArticleService).query(query, undefined, 0, 5);
      articles = res[1];
      await Promise.all(articles.filter(a => a.lazyLoading).map(a => a.lazyLoading!()).concat(type.loadAdditionalsSync ? articles.filter(a => a.lazyLoadingAddition).map(a => a.lazyLoadingAddition!()) : []))
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
    var recommandTitle = '';
    try {
      var count = await locator.locate(IConfigsService).getValueOrDefaultNumber(ConfigKeys.RECOMMENT_COUNT) || 0;
      if (count) {
        var query = new Query()
          .setWhere(new Condition()
            .setType(Condition.ConditionType.AND)
            .setChildrenList([
              new Condition().setType(Condition.ConditionType.EQUAL)
                .setProp('Type')
                .setValue('0'),
              ...(subjectId ? [new Condition().setType(Condition.ConditionType.STARTS_WITH)
                .setProp('Path').setValue(subjectId)] : []),
              new Condition().setType(Condition.ConditionType.EQUAL)
                .setProp('AdditionalType')
                .setValue(ArticleAdditionalType.Recommend.toString())
            ])
          ).setOrderBy('Random')
        var res = await locator.locate(IArticleService).query(query, undefined, 0, count);
        recommendsArticles = res[1];
        await Promise.all(recommendsArticles.filter(a => a.lazyLoading).map(a => a.lazyLoading!()).concat(type.loadAdditionalsSync ? recommendsArticles.filter(a => a.lazyLoadingAddition).map(a => a.lazyLoadingAddition!()) : []))
        recommandTitle = await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.RECOMMENT_TITLE)!;
      }
    } catch (e) {
      //ignore
    }
    const s = locator.locate(IArticleViewServie)
    var types = new Map();
    for (var a of articles) {
      types.set(a, await s.getArticleType(locator.locate(IConfigsService), type, type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined))
    }
    for (var a of recommendsArticles) {
      types.set(a, await s.getArticleType(locator.locate(IConfigsService), type, type.subTypeTag ? a.tagsDict?.get(type.subTypeTag!)?.value : undefined))
    }
    if (recommandTitle) {
      setRecommendTitle(recommandTitle);
    }
    setArticleTypes(types)
    setArticles(articles)
    setRecommendsArticles(recommendsArticles)
  }

  const fetchType = async () => {
    var plugins = locator.locate(PluginsConfig);
    const type = ((user?.editingPermission ? plugins.AllTypes : plugins.NormalTypes))[0];
    setType(type);
  }

  useEffect(() => {
    fetchArticles()
  }, [type])

  useEffect(() => {
    fetchType()
  }, [])

  if (!type || !articles?.length) {
    return <></>
  }
  return (
    <div className="recents-view">
      <Button type="link" className="title">{langs.get(LangKeys.Latest)}</Button>
      <Carousel>
        {
          recommendsArticles.map(article => <RecentArticle recommendView={true} recommendTitle={recommandTitle} article={article} key={article.id + "_rec"} type={type} contentType={articleTypes.get(article)!} ></RecentArticle>)
        }
        {
          articles.map(article => <RecentArticle article={article} key={article.id} type={type} contentType={articleTypes.get(article)!} ></RecentArticle>)
        }
      </Carousel>
    </div>

  )
}
