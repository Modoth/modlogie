import './Library.css'
import './Library.less'
import { ArticleType, ArticleContentType, PluginsConfig } from '../../pluginbase/IPluginInfo'
import { Button, Space, Radio, Pagination, Drawer, Table, Tree, Input, Badge } from 'antd'
import { IPublishService } from '../../domain/ServiceInterfaces/IPublishService'
import { MmIcon } from '../common/Icons'
import { PlusOutlined, AppstoreOutlined, SearchOutlined, CloseOutlined, HeartFilled } from '@ant-design/icons'
import { shuffle } from '../../infrac/Lang/shuffle'
import { useLocation, Redirect } from 'react-router-dom'
import { useServicesLocate, useUser } from '../common/Contexts'
import { v4 } from 'uuid'
import Article, { ArticleTag, ArticleAdditionalType, ArticleWeights } from '../../domain/ServiceInterfaces/Article'
import ArticleListSummary from './ArticleListSummary'
import ArticleView from './ArticleView'
import classNames from 'classnames'
import ConfigKeys, { getArticleTags } from '../../domain/ServiceInterfaces/ConfigKeys'
import defaultLogo from '../assets/logo.png'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFavoritesService from '../../domain/ServiceInterfaces/IFavoritesService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ISubjectsExporter from '../../domain/ServiceInterfaces/ISubjectsExporter'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import ITagsService, { Tag, TagType } from '../../domain/ServiceInterfaces/ITagsService'
import IViewService, { IPromptField } from '../../app/Interfaces/IViewService'
import React, { useState, useEffect, memo } from 'react'
import Seperators from '../../domain/ServiceInterfaces/Seperators'
import Subject from '../../domain/ServiceInterfaces/Subject'
import SubjectViewModel from './SubjectViewModel'
import TitleBar from './TitleBar'

const ArticleViewerMemo = memo(ArticleView)

export class LibraryProps {
  type: ArticleType;
}
export default function Library (props: LibraryProps) {
  const user = useUser()
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
  const location = useLocation()
  const params = (location.state || {}) as {
    subjectId?: string;
    articleId?: string;
    recommendView?: boolean;
  }
  let type:ArticleType|undefined
  if (!params.articleId) {
    const config = locate(PluginsConfig)
    type = (user.editingPermission
      ? config.AllTypes
      : config.NormalTypes
    ).find((t) => t.rootSubjectId === props.type.rootSubjectId)
    if (!type) {
      return <Redirect to="/"></Redirect>
    }
  }
  const [privateOptions] = useState(() => ({
    [langs.get(LangKeys.Default)]: undefined,
    [langs.get(LangKeys.Private)]: true,
    [langs.get(LangKeys.Public)]: false
  }))
  const [showFilter, setShowFilter] = useState(false)
  const [articleId, setArticleId] = useState(params.articleId)
  const [articleRecommendView] = useState(params.recommendView || false)
  const [subjects, setSubjects] = useState<SubjectViewModel[]>([])
  const [logo, setLogo] = useState('')
  const [subjectsDict, setSubjectsDict] = useState<
    Map<string, SubjectViewModel>
  >(new Map())
  const [subjectsIdDict, setSubjectsIdDict] = useState<
    Map<string, SubjectViewModel>
  >(new Map())
  const [rootSubject, setRootSubject] = useState<Subject | null>(null)
  const [filter, setFilter] = useState('')
  const [effectiveSubjects, setEffectiveSubjects] = useState<
    SubjectViewModel[]
  >([])
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    params.subjectId ? [params.subjectId!] : []
  )
  const fetchSubjects = async () => {
    const subjectsDict = new Map<string, SubjectViewModel>()
    const getDisplayName = (id: string) =>
      id === props.type.rootSubjectId ? type?.displayName : undefined
    const _ = (await locate(ISubjectsService).all()).map(
      (s) => new SubjectViewModel(s, subjectsDict, undefined, getDisplayName)
    )
    const newRecommendCount =
      (await locate(IConfigsService)
        .getValueOrDefaultNumber(ConfigKeys.RECOMMENT_COUNT)) || 0
    setSubjectsDict(subjectsDict)
    const subjectsIdDict = new Map(
      Array.from(subjectsDict.values(), (s) => [s.id, s])
    )
    setSubjectsIdDict(subjectsIdDict)
    const rootSubject = props.type.rootSubjectId
      ? subjectsIdDict.get(props.type.rootSubjectId)
      : null
    setSubjects(rootSubject ? [rootSubject] : [])
    selectSubjects(params.subjectId ? [params.subjectId!] : [], subjectsIdDict)
    if (newRecommendCount !== recommendCount) {
      setRecommendCount(newRecommendCount)
    }
    setRootSubject(rootSubject!)
  }

  const selectSubjects = (ids: string[], allIds?: any) => {
    const rootId = props.type.rootSubjectId!
    allIds = allIds || subjectsIdDict
    const selectedIds = ids.length ? ids : rootId ? [rootId] : []
    const subjects = selectedIds
      .map((id) => allIds.get(id))
      .filter((s) => s)
      .map((s) => s!)
    const effectiveSubjectsSet = new Set(subjects)
    for (const s of subjects) {
      let parent = s.parent
      while (parent != null) {
        if (effectiveSubjectsSet.has(parent)) {
          effectiveSubjectsSet.delete(s)
          break
        }
        parent = parent.parent
      }
    }
    const effectiveSubjects = Array.from(effectiveSubjectsSet)
    setSelectedSubjectIds(ids)
    setEffectiveSubjects(effectiveSubjects)
  }

  const [articleTags, setArticleTags] = useState<ArticleTag[]>([])
  const [tags, setTags] = useState(new Map<string, Tag>())
  const [publishTags, setPublishTags] = useState<ArticleTag[]>([])
  const [selectedPublishTag, setSelectedPublishTag] = useState<ArticleTag|undefined>(undefined)
  const [selectedPrivate, setSelectedPrivate] = useState<boolean|undefined>(undefined)
  const [selectedWeight, setSelectedWeight] = useState<number|undefined>()
  const fetchTags = async () => {
    const tagsService = locate(ITagsService)
    const allTags = (await tagsService.all())
    const tagsDict = new Map(allTags.map((n) => [n.name!, n]))
    const tagNames = await locate(IConfigsService)
      .getValuesOrDefault(getArticleTags(props.type.name))
    if (props.type.subTypeTag) {
      tagNames.push(props.type.subTypeTag)
    }
    if (type?.publishGenerators?.size) {
      const publishService = locate(IPublishService)
      const publishTags:ArticleTag[] = []
      publishTags.push(new ArticleTag(LangKeys.PUBLISH_NONE, [], ''))
      type.publishGenerators.forEach((_, publishName) => {
        var tag = tagsDict.get(publishService.getTagName(publishName))
        if (!tag) {
          return
        }
        publishTags.push(new ArticleTag(tag.name, [], tag.id, undefined, langs.get(publishName)))
      })
      setPublishTags(publishTags)
      setSelectedPublishTag(publishTags[0])
    }
    if (!tagNames.length) {
      return
    }

    setTags(tagsDict)
    setArticleTags(
      tagNames
        .map((name) => tagsDict.get(name))
        .filter((t) => t && t.type === TagType.ENUM)
        .map((tag) => {
          return new ArticleTag(tag!.name, tag!.values || [], tag!.id!)
        })
    )
  }
  const updateTagValue = (idx: number, tag: ArticleTag, value?: string) => {
    articleTags.splice(idx, 1, { ...tag, value })
    setArticleTags([...articleTags])
  }

  const [articles, setArticles] = useState<Article[]>([])
  const [recommendsArticles, setRecommendsArticles] = useState<Article[]>([])
  const [recommendCount, setRecommendCount] = useState(0)

  const [currentPage, setCurrentPage] = useState(0)
  const [articleHandlers] = useState<{
    onDelete: {(id: string): void };
    editingArticle?: Article;
      }>({} as any)
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10

  const [favoriteService] = useState(locate(IFavoritesService))
  const [favorite, setFavorite] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)

  const bottomRef = React.createRef<HTMLDivElement>()

  const convertArticle = (article: Article) => {
    (article as any)!.key = v4()
    return article
  }

  const fetchArticlesInternal = async (
    skip: number,
    take: number,
    ignoreArticleId = false
  ): Promise<[number, Article[]]> => {
    const articlesService = locate(IArticleService)
    const Query = articlesService.Query()
    const Condition = articlesService.Condition()
    const query = new Query()
    if (favorite) {
      const [ids, count] = await favoriteService.get(props.type.name, skip, take)
      const order = new Map(ids.map((id, idx) => [id, idx]))
      if (ids.length === 0 || count === 0) {
        return [0, []]
      }
      query.setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            new Condition()
              .setType(Condition.ConditionType.OR)
              .setChildrenList(
                ids.map((id) =>
                  new Condition()
                    .setType(Condition.ConditionType.EQUAL)
                    .setProp('Id')
                    .setValue(id)
                )
              )
          ])
      )
      const res = await locate(IArticleService)
        .query(query, undefined, 0, 0)
      return [
        count,
        res[1].sort((r1, r2) => order.get(r1.id!)! - order.get(r2.id!)!)
      ]
    }
    if (articleId && !ignoreArticleId) {
      if (articleRecommendView) {
        return [0, []]
      }
      query.setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Id')
              .setValue(articleId)
          ])
      )
    } else {
      query.setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            ...(!user?.editingPermission
              ? [
                new Condition()
                  .setType(Condition.ConditionType.EQUAL)
                  .setProp('AdditionalType')
                  .setValue(ArticleAdditionalType.Normal.toString())
              ]
              : []),
            ...(effectiveSubjects.length
              ? [
                new Condition()
                  .setType(Condition.ConditionType.OR)
                  .setChildrenList(
                    effectiveSubjects.map((sbj) =>
                      new Condition()
                        .setType(Condition.ConditionType.STARTS_WITH)
                        .setProp('Path')
                        .setValue(sbj!.path!)
                    )
                  )
              ]
              : []),
            ...(selectedPublishTag && selectedPublishTag.id ? [
              new Condition()
                .setType(Condition.ConditionType.HAS)
                .setProp(selectedPublishTag.name)
            ] : []),
            ...(selectedPrivate !== undefined ? [
              new Condition()
                .setType(Condition.ConditionType.EQUAL)
                .setProp('Private')
                .setValue(selectedPrivate.toString())
            ] : []),
            ...(selectedWeight !== undefined ? [
              new Condition()
                .setType(Condition.ConditionType.EQUAL)
                .setProp('Weight')
                .setValue(selectedWeight.toString())
            ] : []),
            ...articleTags
              .filter((t) => t.value)
              .map((t) =>
                new Condition()
                  .setType(Condition.ConditionType.EQUAL)
                  .setProp(t.name)
                  .setValue(t.value!)
              )
          ])
      )
      if (props.type.orderBy) {
        query.setOrderBy(props.type.orderBy)
        if (props.type.orderByDesc) {
          query.setOrderByDesc(true)
        }
      } else {
        query.setOrderBy('Name')
      }
    }

    return await articlesService.query(query, filter, skip, take)
  }

  locate(IArticleListService).getArticles = async (
    skip: number,
    take: number
  ): Promise<[number, [Article, ArticleContentType][]]> => {
    const [total, articles] = await fetchArticlesInternal(skip, take)
    const articlesWithType: [Article, ArticleContentType][] = []
    for (const a of articles) {
      articlesWithType.push([
        a,
        await locate(IArticleAppservice)
          .getArticleType(
            locate(IConfigsService),
            props.type,
            props.type.subTypeTag
              ? a.tagsDict?.get(props.type.subTypeTag!)?.value
              : undefined
          )
      ])
    }
    return [total, articlesWithType]
  }

  const fetchRecommendArticles = async () => {
    if (articleId && !articleRecommendView) {
      return
    }
    const articlesService = locate(IArticleService)
    const Query = articlesService.Query()
    const Condition = articlesService.Condition()
    const query = articleId
      ? new Query().setWhere(
        new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            new Condition()
              .setType(Condition.ConditionType.EQUAL)
              .setProp('Id')
              .setValue(articleId)
          ])
      )
      : new Query()
        .setWhere(
          new Condition()
            .setType(Condition.ConditionType.AND)
            .setChildrenList([
              new Condition()
                .setType(Condition.ConditionType.EQUAL)
                .setProp('Type')
                .setValue('0'),
              new Condition()
                .setType(Condition.ConditionType.EQUAL)
                .setProp('AdditionalType')
                .setValue(ArticleAdditionalType.Recommend.toString()),
              new Condition()
                .setType(Condition.ConditionType.STARTS_WITH)
                .setProp('Path')
                .setValue(rootSubject?.path!)
            ])
        )
        .setOrderBy('Random')
    const [_, articles] = await articlesService
      .query(query, '', 0, recommendCount)
    shuffle(articles)
    setRecommendsArticles(articles)
  }

  useEffect(() => {
    if (recommendCount) {
      fetchRecommendArticles()
    }
  }, [rootSubject])

  const fetchArticles = async (page?: number, clearArticleId = false) => {
    if (page === undefined) {
      page = currentPage
    }
    try {
      viewService.setLoading(true)
      const [total, articles] = await fetchArticlesInternal(
        countPerPage * (page! - 1),
        countPerPage,
        clearArticleId
      )
      setArticles(articles.map(convertArticle))
      setTotalCount(total)
      setCurrentPage(page)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      viewService.setLoading(false)
      return false
    } finally {
      if (clearArticleId && articleId) {
        setArticleId(undefined)
      }
    }
    viewService.setLoading(false)
    window.scrollTo(0, 0)
  }

  const updateArticleTag = async (
    article: Article,
    tag: ArticleTag,
    tagValue: string
  ) => {
    const api = locate(IArticleService)
    try {
      await api.updateTags(article.id!, { id: tag.id!, value: tagValue })
      if (!article.tagsDict) {
        article.tagsDict = new Map()
        article.tags = article.tags || []
      }
      if (!article.tagsDict.has(tag.name)) {
        const newTag: ArticleTag = {
          id: tag.id,
          name: tag.name,
          value: tagValue,
          values: tag.values
        }
        article.tags!.push(newTag)
        article.tagsDict.set(tag.name, newTag)
      } else {
        const updatedTag = article.tagsDict.get(tag.name)
        updatedTag!.value = tagValue
      }
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const addArticleWithTags = async (name: string, pri?: boolean) => {
    if (!name) {
      return
    }
    try {
      const parentId = selectedSubjectIds.length
        ? selectedSubjectIds[selectedSubjectIds.length - 1]
        : rootSubject?.id
      const service = locate(IArticleService)
      const newArticle = convertArticle(
        (await service.add(name, parentId || ''))!
      )
      for (const tag of articleTags) {
        if (tag.value) {
          await updateArticleTag(newArticle, tag, tag.value)
        }
      }
      var date = new Date()
      await service.updatePublished(newArticle.id!, date)
      newArticle.published = date
      if (pri !== undefined) {
        await service.updatePrivate(newArticle.id!, pri)
        newArticle.private = pri
      }
      articleHandlers.editingArticle = newArticle
      setArticles([...articles, newArticle])
      bottomRef.current &&
        bottomRef.current.scrollIntoView({ behavior: 'smooth' })
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return false
    }
  }

  const addArticle = async () => {
    const privateFile = await locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.NEW_FILE_DEFAULT_PRIVATE)
    const fields : IPromptField<any, any>[] = []
    const priValues = Array.from(Object.keys(privateOptions))
    const autoName = props.type.noTitle ? v4() : ''
    if (!autoName) {
      fields.push({ type: 'Text', value: '', hint: langs.get(LangKeys.Name) })
    }
    fields.push({ type: 'Enum', values: priValues, value: privateFile ? priValues[1] : priValues[0], hint: '' })
    viewService.prompt(
      langs.get(LangKeys.Create),
      fields,
      async (v1: string, v2: string) => {
        if (autoName) {
          return addArticleWithTags(autoName, privateOptions[v1])
        }
        return addArticleWithTags(v1, privateOptions[v2])
      }
    )
  }

  const deleteArticle = (id: string) => {
    viewService.prompt(langs.get(LangKeys.Delete), [], async () => {
      try {
        await locate(IArticleService).delete(id)
        const idx = articles.findIndex((a) => a.id === id)
        if (~idx) {
          articles.splice(idx, 1)
          setArticles([...articles])
        }
      } catch (e) {
        viewService!.errorKey(langs, e.message)
        return false
      }
      return true
    })
  }

  const exportMm = () => {
    locate(ISubjectsExporter).export(effectiveSubjects)
  }

  articleHandlers.onDelete = deleteArticle

  useEffect(() => {
    viewService.setShowTitle?.(false)
    fetchSubjects().then(() => fetchTags());
    (async () => {
      const logo =
        (await locate(IConfigsService)
          .getResource(ConfigKeys.WEB_SITE_LOGO)) || defaultLogo
      setLogo(logo)
    })()
    if (favoriteService) {
      favoriteService.count(props.type.name).then((c) => setFavoriteCount(c))
      favoriteService.setCountChangedHandler(props.type.name, setFavoriteCount)
    }
    return () => {
      viewService.setShowTitle?.(true)
      viewService.setFloatingMenus?.(Library.name)
      favoriteService.unsetCountChangedHandler(props.type.name)
      viewService.previewArticle()
    }
  }, [])

  useEffect(() => {
    if (!subjects.length || !rootSubject) {
      return
    }
    fetchArticles(1)
  }, [rootSubject, favorite])

  useEffect(() => {
    if (viewService.setFloatingMenus) {
      viewService.setFloatingMenus(Library.name, <>
        {user.printPermission ? (
          <ArticleListSummary></ArticleListSummary>
        ) : null}
        {favoriteService && (favorite || favoriteCount) ? (
          <Badge count={favoriteCount}>
            <Button
              icon={<HeartFilled />}
              type = 'primary'
              danger={favorite}
              size="large"
              shape="circle"
              onClick={() => {
                setFavorite(!favorite)
              }}
            ></Button>
          </Badge>
        ) : null}
        {user.editingPermission ? (
          <Button
            icon={<PlusOutlined />}
            type="primary"
            size="large"
            shape="circle"
            onClick={addArticle}
          ></Button>
        ) : null}
      </>,
      <Button
        type = 'primary'
        danger={!!filter ||
            !!(selectedPublishTag && selectedPublishTag.id) ||
            !!(articleTags && articleTags.filter((t) => t.value).length) ||
            !!(selectedSubjectIds.length && effectiveSubjects?.[0]?.id !== type?.rootSubjectId)
        }
        size="large"
        shape="circle"
        onClick={() => setShowFilter(true)}
        icon={<SearchOutlined />}
      ></Button>)
    }
  })
  const titleClick = () => {
    if (articleId) {
      fetchArticles(1, true)
    } else {
      setShowFilter(true)
    }
  }
  return (
    <div className={classNames('library', type?.name || '', type?.pluginName || '')}>
      <TitleBar
        title={rootSubject && effectiveSubjects.length < 2
          ? (effectiveSubjects[0]?.id === rootSubject?.id ? type?.displayName || '' : (effectiveSubjects[0] || rootSubject).name)
          : (Seperators.joinItems(effectiveSubjects.map((sbj) => sbj.name)) || type?.displayName || '') }
        onClick={titleClick} menus={[
          {
            title: langs.get(LangKeys.Home),
            link: '/',
            icon: <AppstoreOutlined className="menu-icon" />
          },
          {
            onClick: titleClick,
            icon: <img className="icon-img" src={(rootSubject && effectiveSubjects.length < 2 ? (effectiveSubjects[0] || rootSubject).resourceUrl : '') || logo}></img>
          } as any
        ]}></TitleBar>

      {articles.length || recommendsArticles.length ? null : (
        <Table
          rowKey="name"
          showHeader={false}
          columns={[]}
          dataSource={[]}
          pagination={false}
        ></Table>
      )}
      <div className="articles">
        {recommendsArticles.map((p) => (
          <div
            className="article-view-wraper"
            key={(p as any)!.key + '_recommend'}
          >
            <ArticleViewerMemo
              article={p}
              subjects={subjects}
              tags={articleTags}
              type={props.type}
              articleHandlers={articleHandlers}
              nodeTags={tags}
              recommendView={true}
            ></ArticleViewerMemo>
          </div>
        ))}
        {articles.map((p) => (
          <div className="article-view-wraper" key={(p as any)!.key}>
            <ArticleViewerMemo
              article={p}
              subjects={subjects}
              tags={articleTags}
              type={props.type}
              articleHandlers={articleHandlers}
              nodeTags={tags}
            ></ArticleViewerMemo>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>
      {totalCount > countPerPage ? (
        <>
          <Pagination
            className="pagination"
            onChange={(page) => fetchArticles(page)}
            pageSize={countPerPage}
            current={currentPage}
            total={totalCount}
            showSizeChanger={false}
          ></Pagination>
        </>
      ) : null}
      <Drawer
        closable={false}
        className={classNames('filter-panel')}
        height="100%"
        visible={showFilter && !favorite}
        placement="bottom"
        onClose={() => setShowFilter(false)}
      >
        <Space className="filters" direction="vertical">
          <div className="filter-menus">
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setShowFilter(false)
              }}
            ></Button>
            {props.type.noTitle ? null : (
              <Input
                placeholder={langs.get(LangKeys.Search)}
                allowClear={true}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowFilter(false)
                    fetchArticles(1)
                  }
                }}
              ></Input>
            )}
            <Button
              type="link"
              icon={<SearchOutlined />}
              onClick={() => {
                setShowFilter(false)
                fetchArticles(1)
              }}
            ></Button>
          </div>
          {user.editingPermission && publishTags && publishTags.length ? <Radio.Group
            className="tag-list"
            defaultValue={publishTags[0]}
            buttonStyle="solid"
            onChange={(e) => setSelectedPublishTag(e.target.value)}
          >
              {...publishTags.map((tag:ArticleTag) => (
                <Radio.Button className="tag-item" key={tag.id} value={tag}>
                  {tag.displayName || langs.get(tag.name)}
                </Radio.Button>
              ))}
          </Radio.Group> : undefined}
          {
            user.editingPermission ? <Radio.Group
              className="tag-list"
              defaultValue={undefined}
              buttonStyle="solid"
              onChange={(e) => setSelectedPrivate(e.target.value)}
            >
              {...[
                { label: langs.get(LangKeys.All), value: undefined },
                { label: langs.get(LangKeys.Private), value: true },
                { label: langs.get(LangKeys.Public), value: false }
              ].map((tag) => (
                <Radio.Button className="tag-item" key={`${tag.value}`} value={tag.value}>
                  {tag.label}
                </Radio.Button>
              ))}
            </Radio.Group> : undefined
          }
          {
            user.editingPermission ? <Radio.Group
              className="tag-list"
              defaultValue={selectedWeight}
              buttonStyle="solid"
              onChange={(e) => setSelectedWeight(e.target.value)}
            >
              {...[
                { label: langs.get(LangKeys.Weight), value: undefined },
                ...ArticleWeights.map(value => ({ label: value.toString(), value }))
              ].map((tag) => (
                <Radio.Button className="tag-item" key={`${tag.value}`} value={tag.value}>
                  {tag.label}
                </Radio.Button>
              ))}
            </Radio.Group> : undefined
          }
          {articleTags.map((tag, i) => (
            <Radio.Group
              className="tag-list"
              key={tag.name}
              defaultValue={tag.value}
              buttonStyle="solid"
              onChange={(e) => updateTagValue(i, tag, e.target.value)}
            >
              <Radio.Button className="tag-item" value={undefined}>
                {langs.get(LangKeys.All)}
              </Radio.Button>
              {...tag.values.map((value) => (
                <Radio.Button className="tag-item" key={value} value={value}>
                  {value}
                </Radio.Button>
              ))}
            </Radio.Group>
          ))}
          <div className="subjects">
            {/* <div className="background background-fixed"></div> */}
            <Button
              type="link"
              size="large"
              icon={<MmIcon></MmIcon>}
              className="export-btn"
              onClick={exportMm}
            ></Button>
            <Tree
              showLine={true}
              treeData={subjects}
              checkable={true}
              multiple={true}
              selectable={true}
              onCheck={(checked) => {
                selectSubjects(checked as any)
              }}
              onSelect={(checked) => {
                selectSubjects(checked as any)
              }}
              checkedKeys={selectedSubjectIds}
              selectedKeys={selectedSubjectIds}
              defaultExpandAll={true}
            />
          </div>
        </Space>
      </Drawer>
    </div>
  )
}
