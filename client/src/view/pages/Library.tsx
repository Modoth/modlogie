import React, { useState, useEffect, memo } from 'react'
import './Library.less'
import './Library.css'
import Subject from '../../domain/Subject'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ISubjectsService from '../../domain/ISubjectsService'
import { TreeSelect, Button, Space, Radio, Pagination, Drawer, Table, Tree, Input } from 'antd'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import { PlusOutlined, SearchOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import IViewService from '../services/IViewService'
import { v4 as uuidv4 } from 'uuid'
import { ArticleType, ArticleContentType } from '../../plugins/IPluginInfo'
import Article, { ArticleTag } from '../../domain/Article'
import ArticleView from './ArticleView'
import ArticleListSummary from './ArticleListSummary'
import { useParams, Link } from 'react-router-dom'
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

const ArticleViewerMemo = memo(ArticleView)

const getTagEnums = (values?: string) => {
  return values
    ? values
      .split(' ')
      .map((s) => s.trim())
      .filter((s) => s)
    : []
}

interface Params {
  subjectId?: string;
}

export class LibraryProps {
  type: ArticleType;
}
export default function Library(props: LibraryProps) {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)

  const params = useParams<Params>()
  const [showFilter, setShowFilter] = useState(false);
  const [subjects, setSubjects] = useState<SubjectViewModel[]>([])
  const [subjectsDict, setSubjectsDict] = useState<
    Map<string, SubjectViewModel>
  >(new Map())
  const [subjectsIdDict, setSubjectsIdDict] = useState<
    Map<string, SubjectViewModel>
  >(new Map())
  const [rootSubjectId, setRootSubjectId] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState('');
  const [effectiveSubjects, setEffectiveSubjects] = useState<SubjectViewModel[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(params.subjectId ? [params.subjectId!] : [])
  const fetchSubjects = async () => {
    const subjectsDict = new Map<string, SubjectViewModel>()
    const _ = (await locator.locate(ISubjectsService).all()).map(
      (s) => new SubjectViewModel(s, subjectsDict)
    )
    setSubjectsDict(subjectsDict)
    var subjectsIdDict = new Map(Array.from(subjectsDict.values(), (s) => [s.id, s]))
    setSubjectsIdDict(subjectsIdDict)
    var rootSubject = props.type.rootSubject ? (subjectsDict.get('/' + props.type.rootSubject)) : null
    setSubjects(rootSubject ? [rootSubject] : [])
    var rootSubjectId = rootSubject?.id
    selectSubjects(params.subjectId ? [params.subjectId!] : [], rootSubjectId, subjectsIdDict)
    setRootSubjectId(rootSubjectId);
  }

  const selectSubjects = (ids: string[], rootId?: any, allIds?: any) => {
    rootId = rootId || rootSubjectId
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
  const [currentPage, setCurrentPage] = useState(0)
  const [articleHandlers] = useState<{ onDelete: { (id: string): void }, editingArticle?: Article }>(
    {} as any
  )
  const [totalCount, setTotalCount] = useState(0)
  const countPerPage = 10

  const bottomRef = React.createRef<HTMLDivElement>();

  const convertArticle = (article: Article) => {
    ; (article as any)!.key = uuidv4()
    return article
  }

  const fetchArticlesInternal = async (skip: number, take: number): Promise<[number, Article[]]> => {
    var query = new Query()
      .setWhere(new Condition()
        .setType(Condition.ConditionType.AND)
        .setChildrenList([
          new Condition().setType(Condition.ConditionType.EQUAL)
            .setProp('Type')
            .setValue('0'),
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
    if (filter) {

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

  const fetchArticles = async (page?: number) => {
    if (page === undefined) {
      page = currentPage
    }
    try {
      viewService.setLoading(true);
      var [total, articles] = await fetchArticlesInternal(countPerPage * (page! - 1), countPerPage)
      setArticles(articles.map(convertArticle))
      setTotalCount(total)
      setCurrentPage(page)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      viewService.setLoading(false);
      return false
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
        : rootSubjectId
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
    return () => {
      viewService.setShowMenu(true);
    }
  }, [])

  useEffect(() => {
    if (!subjects.length || (!rootSubjectId && props.type.rootSubject)) {
      return
    }
    fetchArticles(1)
  }, [rootSubjectId])

  return (
    <div className="library">
      <div className="searched-subjects" >
        <Link to="/"><Button type="link" size="large" icon={<ArrowLeftOutlined />} /></Link>

        <span onClick={() => setShowFilter(true)} className="searched-subjects-title">{effectiveSubjects.map(sbj => sbj.name).join(',') || props.type.rootSubject || ''}</span>
        <Button onClick={exportMm} type="link" size="large" icon={<MmIcon />} />
      </div>
      {
        articles.length ? null : <Table
          rowKey="name"
          showHeader={false}
          columns={[
          ]}
          dataSource={[]}
          pagination={false}
        ></Table>
      }
      <div className="articles" >
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
      <div className="float-menus">
        <ArticleListSummary></ArticleListSummary>
        {user ? (
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
    </div>
  )
}
