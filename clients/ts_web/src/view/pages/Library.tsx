import React, { useState, useEffect, memo } from 'react'
import './Library.less'
import './Library.css'
import Subject from '../../domain/Subject'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ISubjectsService from '../../domain/ISubjectsService'
import { TreeSelect, Button, Space, Radio, Pagination, Drawer, Table, Tree, Input, Badge } from 'antd'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import { PlusOutlined, SearchOutlined, CloseOutlined, ArrowLeftOutlined, ArrowRightOutlined, HeartFilled } from '@ant-design/icons'
import IViewService from '../services/IViewService'
import { v4 as uuidv4 } from 'uuid'
import { ArticleType, ArticleContentType, PluginsConfig } from '../../plugins/IPluginInfo'
import Article, { ArticleTag, ArticleAdditionalType } from '../../domain/Article'
import ArticleView from './ArticleView'
import ArticleListSummary from './ArticleListSummary'
import { useParams, Link, useLocation, Redirect } from 'react-router-dom'
import ITagsService, { TagNames, Tag, TagType } from '../../domain/ITagsService'
import { generateRandomStyle } from './common'
import classNames from 'classnames'
import Langs from '../Langs'
import { Error as ErrorMessage } from '../../apis/messages_pb'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys, { get_ARTICLE_TAGS } from '../../app/ConfigKeys'
import IArticleService from '../../domain/IArticleService'
import { Query, Condition } from '../../apis/files_pb'
import SubjectViewModel from './SubjectViewModel'
import IArticleListService from '../../domain/IArticleListService'
import IArticleViewServie from '../services/IArticleViewService'
import IMmConverter from '../../domain/IMmConverter'
import ISubjectsExporter from '../../domain/ISubjectsExporter'
import { MmIcon } from '../components/Icons'
import IFavoritesServer from '../../domain/IFavoritesServer'
import { shuffle } from '../../common/shuffle'
import defaultLogo from '../../assets/logo.png'

const ArticleViewerMemo = memo(ArticleView)

const getTagEnums = (values?: string) => {
  return values
    ? values
      .split(' ')
      .map((s) => s.trim())
      .filter((s) => s)
    : []
}

export class LibraryProps {
  type: ArticleType;
}
export default function Library(props: LibraryProps) {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const location = useLocation();
  const params:
    {
      subjectId?: string;
      articleId?: string;
      recommendView?: boolean;
    }
    = location.state || {}

  if (!params.articleId) {
    var config = locator.locate(PluginsConfig)
    var type = ((user.editingPermission ? config.AllTypes : config.NormalTypes)).find(t => t.rootSubjectId === props.type.rootSubjectId)
    if (!type) {
      return <Redirect to='/'></Redirect>
    }
  }
  const [showFilter, setShowFilter] = useState(false);
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
  const [rootSubject, setRootSubject] = useState<Subject | null>(null);
  const [filter, setFilter] = useState('');
  const [effectiveSubjects, setEffectiveSubjects] = useState<SubjectViewModel[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(params.subjectId ? [params.subjectId!] : [])
  const fetchSubjects = async () => {
    const subjectsDict = new Map<string, SubjectViewModel>()
    const _ = (await locator.locate(ISubjectsService).all()).map(
      (s) => new SubjectViewModel(s, subjectsDict)
    )
    const newRecommendCount = await locator.locate(IConfigsService).getValueOrDefaultNumber(ConfigKeys.RECOMMENT_COUNT) || 0
    setSubjectsDict(subjectsDict)
    var subjectsIdDict = new Map(Array.from(subjectsDict.values(), (s) => [s.id, s]))
    setSubjectsIdDict(subjectsIdDict)
    var rootSubject = props.type.rootSubjectId ? (subjectsIdDict.get(props.type.rootSubjectId)) : null
    setSubjects(rootSubject ? [rootSubject] : [])
    selectSubjects(params.subjectId ? [params.subjectId!] : [], subjectsIdDict)
    if (newRecommendCount !== recommendCount) {
      setRecommendCount(newRecommendCount)
    }
    setRootSubject(rootSubject!);
  }

  const selectSubjects = (ids: string[], allIds?: any) => {
    var rootId = props.type.rootSubjectId!;
    allIds = allIds || subjectsIdDict
    let selectedIds = ids.length ? ids : (rootId ? [rootId] : [])
    let subjects = selectedIds.map(id => allIds.get(id)).filter(s => s).map(s => s!);
    var effectiveSubjectsSet = new Set(subjects);
    for (var s of subjects) {
      let parent = s.parent
      while (parent != null) {
        if (effectiveSubjectsSet.has(parent)) {
          effectiveSubjectsSet.delete(s)
          break
        }
        parent = parent.parent
      }
    }
    var effectiveSubjects = Array.from(effectiveSubjectsSet);
    setSelectedSubjectIds(ids);
    setEffectiveSubjects(effectiveSubjects)

  }

  const [articleTags, setArticleTags] = useState<ArticleTag[]>([])
  const [tags, setTags] = useState(new Map<string, Tag>())
  const fetchTags = async () => {
    const tagsService = locator.locate(ITagsService)
    const allTags = (await tagsService.all()).filter(t => t.type === TagType.ENUM);
    const tagsDict = new Map(allTags.map((n) => [n.name!, n]))
    const tagNames = (await locator.locate(IConfigsService).getValuesOrDefault(get_ARTICLE_TAGS(props.type.name)))
    if (props.type.subTypeTag) {
      tagNames.push(props.type.subTypeTag)
    }
    if (!tagNames.length) {
      return
    }

    setTags(tagsDict)
    setArticleTags(
      tagNames.map(name => tagsDict.get(name)).filter(t => t).map((tag) => {
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
  const [recommendCount, setRecommendCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(0)
  const [articleHandlers] = useState<{ onDelete: { (id: string): void }, editingArticle?: Article }>(
    {} as any
  )
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10

  const [favoriteService] = useState(locator.locate(IFavoritesServer))
  const [favorite, setFavorite] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)

  const bottomRef = React.createRef<HTMLDivElement>();

  const convertArticle = (article: Article) => {
    ; (article as any)!.key = uuidv4()
    return article
  }

  const fetchArticlesInternal = async (skip: number, take: number, ignoreArticleId = false): Promise<[number, Article[]]> => {
    var query = new Query();
    if (favorite) {
      var [ids, count] = await favoriteService.get(props.type.name, skip, take)
      var order = new Map(ids.map((id, idx) => [id, idx]))
      if (ids.length === 0 || count === 0) {
        return [0, []]
      }
      query.setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
          new Condition().setType(Condition.ConditionType.OR).setChildrenList(ids.map(id => new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Id')
            .setValue(id)))
        ]))
      var res = await locator.locate(IArticleService).query(query, undefined, 0, 0)
      return [count, res[1].sort((r1, r2) => order.get(r1.id!)! - order.get(r2.id!)!)]
    }
    if (articleId && !ignoreArticleId) {
      if (articleRecommendView) {
        return [0, []]
      }
      query.setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Id')
            .setValue(articleId),
        ]))
    } else {
      query.setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
          ...(!user?.editingPermission ? [new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('AdditionalType')
            .setValue(ArticleAdditionalType.Normal.toString())] : []),
          ...effectiveSubjects.length ? [
            new Condition().setType(Condition.ConditionType.OR)
              .setChildrenList(effectiveSubjects.map(sbj => new Condition().setType(Condition.ConditionType.STARTS_WITH)
                .setProp('Path').setValue(sbj!.path!)))
          ] : [],
          ...articleTags.filter(t => t.value).map(t =>
            new Condition().setType(Condition.ConditionType.EQUAL)
              .setProp(t.name).setValue(t.value!))
        ])
      )
      if (props.type.orderBy) {
        query.setOrderBy(props.type.orderBy)
        if (props.type.orderByDesc) {
          query.setOrderByDesc(true)
        }
      }
    }

    return await locator.locate(IArticleService).query(query, filter, skip, take)
  }

  locator.locate(IArticleListService).getArticles = async (skip: number, take: number): Promise<[number, [Article, ArticleContentType][]]> => {
    var [total, articles] = await fetchArticlesInternal(skip, take);
    var articlesWithType: [Article, ArticleContentType][] = [];
    for (var a of articles) {
      articlesWithType.push([a,
        await locator.locate(IArticleViewServie)
          .getArticleType(locator.locate(IConfigsService),
            props.type,
            props.type.subTypeTag ? a.tagsDict?.get(props.type.subTypeTag!)?.value : undefined)])
    }
    return [total, articlesWithType];
  };

  const fetchRecommendArticles = async () => {
    if (articleId && !articleRecommendView) {
      return;
    }
    var query = articleId ? new Query().setWhere(new Condition()
      .setType(Condition.ConditionType.AND)
      .setChildrenList([
        new Condition().setType(Condition.ConditionType.EQUAL)
          .setProp('Type')
          .setValue('0'),
        new Condition().setType(Condition.ConditionType.EQUAL)
          .setProp('Id')
          .setValue(articleId),
      ])) : new Query().setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('AdditionalType')
            .setValue(ArticleAdditionalType.Recommend.toString()),
          new Condition().setType(Condition.ConditionType.STARTS_WITH)
            .setProp('Path').setValue(rootSubject?.path!)
        ])).setOrderBy('Random')
    var [_, articles] = await locator.locate(IArticleService).query(query, '', 0, recommendCount)
    shuffle(articles);
    setRecommendsArticles(articles);
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
      viewService.setLoading(true);
      var [total, articles] = await fetchArticlesInternal(countPerPage * (page! - 1), countPerPage, clearArticleId)
      setArticles(articles.map(convertArticle))
      setTotalCount(total)
      setCurrentPage(page)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      viewService.setLoading(false);
      return false
    }
    finally {
      if (clearArticleId && articleId) {
        setArticleId(undefined)
      }
    }
    viewService.setLoading(false);
    window.scrollTo(0, 0);
  }

  const updateArticleTag = async (
    article: Article,
    tag: ArticleTag,
    tagValue: string
  ) => {
    const api = locator.locate(IArticleService)
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

  const addArticleWithTags = async (name: string) => {
    if (!name) {
      return
    }
    try {
      const parentId = selectedSubjectIds.length
        ? selectedSubjectIds[selectedSubjectIds.length - 1]
        : rootSubject?.id
      const service = locator.locate(IArticleService)
      const newArticle = convertArticle(
        (await service.add(name, parentId || ''))!
      );
      for (const tag of articleTags) {
        if (tag.value) {
          await updateArticleTag(newArticle, tag, tag.value)
        }
      }
      articleHandlers.editingArticle = newArticle
      setArticles([...articles, newArticle])
      bottomRef.current && bottomRef.current.scrollIntoView({ behavior: "smooth" });
      return true
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return false
    }
  }

  const addArticle = () => {
    if (props.type.noTitle) {
      return addArticleWithTags(uuidv4())
    }
    viewService.prompt(
      langs.get(LangKeys.Create),
      [
        { type: 'Text', value: '', hint: langs.get(LangKeys.Name) },
      ],
      async (name: string) => {
        return addArticleWithTags(name)
      })
  }

  const deleteArticle = (id: string) => {
    viewService.prompt(langs.get(LangKeys.Delete), [], async () => {
      try {
        await locator.locate(IArticleService).delete(id);
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
    locator.locate(ISubjectsExporter).export(effectiveSubjects);
  }

  articleHandlers.onDelete = deleteArticle

  const subjectTreeRef = React.createRef<TreeSelect<any>>()

  viewService.setShowMenu(false)
  useEffect(() => {
    viewService.setShowMenu(false)
    fetchSubjects().then(() => fetchTags())
      ; (async () => {
        var logo = await locator.locate(IConfigsService).getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo;
        setLogo(logo);
      })()
    if (favoriteService) {
      favoriteService.count(props.type.name).then(c => setFavoriteCount(c));
      favoriteService.setCountChangedHandler(props.type.name, setFavoriteCount);
    }
    return () => {
      viewService.setShowMenu(true);
      favoriteService.unsetCountChangedHandler(props.type.name);
      viewService.previewArticle()
    }
  }, [])

  useEffect(() => {
    if (!subjects.length || (!rootSubject)) {
      return
    }
    fetchArticles(1)
  }, [rootSubject, favorite])

  return (
    <div className="library">
      <div className="searched-subjects" >
        <Link to="/"><Button type="link" size="large" icon={logo ? <img className="home-icon"
          src={logo}
        /> : null} /></Link>
        <span onClick={() => {
          if (articleId) {
            fetchArticles(1, true)
          } else {
            setShowFilter(true)
          }
        }} className="searched-subjects-title">{articleId ? <Button type="link" danger className="go-back-btn" icon={<ArrowRightOutlined />}></Button> : undefined}{
            rootSubject && effectiveSubjects.length < 2 ?
              <><img className="subject-icon" src={(effectiveSubjects[0] || rootSubject).resourceUrl}></img><span>{(effectiveSubjects[0] || rootSubject).name}</span></> :
              effectiveSubjects.map(sbj => sbj.name).join(',') || rootSubject?.name || ''
          }</span>
        <Button onClick={exportMm} type="link" size="large" icon={<MmIcon />} />
      </div>
      {
        articles.length || recommendsArticles.length ? null : <Table
          rowKey="name"
          showHeader={false}
          columns={[
          ]}
          dataSource={[]}
          pagination={false}
        ></Table>
      }
      <div className="articles" >
        {recommendsArticles.map((p) => (
          <div className="article-view-wraper" key={(p as any)!.key + '_recommend'}>
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
      {
        totalCount > countPerPage ? (
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
        ) : null
      }
      <div className="float-menus">
        {user.printPermission ? <ArticleListSummary></ArticleListSummary> : null}
        {favoriteService && (favorite || favoriteCount) ?
          <Badge count={favoriteCount}>
            <Button
              icon={<HeartFilled />}
              type={favorite ? "primary" : "default"}
              size="large" shape="circle"
              onClick={() => {
                setFavorite(!favorite)
              }}></Button>
          </Badge>
          : null}
        <Button type="default"
          size="large" shape="circle" onClick={() => setShowFilter(true)} icon={<SearchOutlined />}></Button>
        {user.editingPermission ? (
          <Button
            icon={<PlusOutlined />}
            type="default"
            size="large" shape="circle"
            onClick={addArticle}
          >
          </Button>
        ) : null}
      </div>
      <Drawer closable={false} className={classNames("filter-panel")} height="100%" visible={showFilter} placement="bottom" onClose={() => setShowFilter(false)}>
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
            {
              props.type.noTitle ?
                null :
                <Input placeholder={langs.get(LangKeys.Search)} allowClear={true} value={filter} onChange={e => setFilter(e.target.value)} onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setShowFilter(false)
                    fetchArticles(1);
                  }
                }}></Input>
            }
            <Button
              type="link"
              icon={<SearchOutlined />}
              onClick={() => {
                setShowFilter(false)
                fetchArticles(1);
              }}
            ></Button>
          </div>
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
    </div >
  )
}
