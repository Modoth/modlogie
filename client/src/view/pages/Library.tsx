import React, { useState, useEffect, memo } from 'react'
import './Library.less'
import Subject from '../../domain/Subject'
import { useServicesLocator, useUser } from '../../app/Contexts'
import ISubjectsService from '../../domain/ISubjectsService'
import { TreeSelect, Button, Space, Radio, Pagination, Drawer, Table } from 'antd'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import { PlusOutlined, SearchOutlined, CloseOutlined, UnorderedListOutlined } from '@ant-design/icons'
import IViewService from '../services/IViewService'
import { v4 as uuidv4 } from 'uuid'
import { ArticleType } from '../../plugins/IPluginInfo'
import Article, { ArticleTag } from '../../domain/Article'
import ArticleView from './ArticleView'
import ArticleListSummary from './ArticleListSummary'
import { useParams } from 'react-router-dom'
import ITagsService, { TagNames, Tag, TagType } from '../../domain/ITagsService'
import { generateRandomStyle } from './common'
import classNames from 'classnames'
import Langs from '../Langs'
import { Error as ErrorMessage } from '../../apis/messages_pb'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys, { get_ARTICLE_TAGS } from '../../app/ConfigKeys'
import IArticleService from '../../domain/IArticleService'
import { Query, Condition } from '../../apis/files_pb'

const ArticleViewerMemo = memo(ArticleView)

export class SubjectViewModel extends Subject {
  get title() {
    return this.name + (this.totalArticleCount ? `(${this.totalArticleCount})` : '');
  }

  get key() {
    return this.id
  }

  get value() {
    return this.id
  }

  children?: SubjectViewModel[];

  parent?: SubjectViewModel;

  constructor(subject: Subject, allSubjects?: Map<string, SubjectViewModel>) {
    super()
    Object.assign(this, subject)
    if (allSubjects) {
      if (allSubjects.has(subject.path!)) {
        console.log('Subject circle error.')
        throw new Error(Langs[ErrorMessage.ENTITY_CONFLICT])
      }
      allSubjects.set(subject.path!, this)
    }
    if (subject.children && subject.children.length) {
      this.children = []
      for (const c of subject.children) {
        const child = new SubjectViewModel(c, allSubjects)
        child.parent = this
        this.children.push(child)
      }
    }
  }
}

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
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(params.subjectId ? [params.subjectId!] : [])
  const fetchSubjects = async () => {
    const subjectsDict = new Map<string, SubjectViewModel>()
    const sbjs = (await locator.locate(ISubjectsService).all()).map(
      (s) => new SubjectViewModel(s, subjectsDict)
    )
    setSubjectsDict(subjectsDict)
    setSubjectsIdDict(new Map(Array.from(subjectsDict.values(), (s) => [s.id, s])))
    var rootSubject = props.type.rootSubject ? (subjectsDict.get('/' + props.type.rootSubject)) : null
    setRootSubjectId(rootSubject?.id);
    setSubjects(rootSubject ? [rootSubject] : sbjs)
    setSelectedSubjectIds(params.subjectId ? [params.subjectId!] : [])
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
      tagNames.map((name) => {
        const tag = tagsDict.get(name)
        return new ArticleTag(name, tag?.values || [], tag!.id!)
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

  const fetchArticles = async (page?: number) => {
    if (page === undefined) {
      page = currentPage
    }
    let selectedIds = selectedSubjectIds.length ? selectedSubjectIds : (rootSubjectId ? [rootSubjectId] : [])
    try {
      var query = new Query()
        .setWhere(new Condition()
          .setType(Condition.ConditionType.AND)
          .setChildrenList([
            new Condition().setType(Condition.ConditionType.EQUAL)
              .setProp('Type')
              .setValue('0'),
            ...selectedIds.length ? [
              new Condition().setType(Condition.ConditionType.OR)
                .setChildrenList(selectedIds.map(sid => new Condition().setType(Condition.ConditionType.STARTS_WITH)
                  .setProp('Path').setValue(subjectsIdDict.get(sid)!.path!)))
            ] : [],
            ...articleTags.filter(t => t.value).map(t =>
              new Condition().setType(Condition.ConditionType.EQUAL)
                .setProp(t.name).setValue(t.value!))
          ])
        )
      var [total, articles] = await locator.locate(IArticleService).query(query, countPerPage * (page! - 1), countPerPage)
      setArticles(articles.map(convertArticle))
      setTotalCount(total)
      setCurrentPage(page)
      window.scrollTo(0, 0);
    } catch (e) {
      viewService!.errorKey(langs, e.message)
      return false
    }
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

  articleHandlers.onDelete = deleteArticle

  const subjectTreeRef = React.createRef<TreeSelect<any>>()

  useEffect(() => {
    fetchSubjects().then(() => fetchTags())
  }, [])

  useEffect(() => {
    if (!subjects.length || (!rootSubjectId && props.type.rootSubject )) {
      return
    }
    fetchArticles(1)
  }, [subjects, selectedSubjectIds])

  return (
    <div className="library">
      <TreeSelect
        multiple={false}
        showSearch={false}
        ref={subjectTreeRef}
        treeDefaultExpandAll={true}
        className="search-subjects"
        onChange={(value) => setSelectedSubjectIds((typeof value === 'string') ? [value] : value)}
        value={selectedSubjectIds}
        treeData={subjects}
        treeCheckable={false}
        virtual={false}
        showCheckedStrategy={'SHOW_PARENT'}
        style={{ width: '100%' }}
        placeholder={langs.get(LangKeys.Subject)}
        dropdownClassName={classNames("library-subjects-drop-down")}
      />
      <Space className="articles" direction="vertical">
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
        {articles.map((p) => (
          <ArticleViewerMemo
            key={(p as any)!.key}
            article={p}
            subjects={subjects}
            tags={articleTags}
            type={props.type}
            articleHandlers={articleHandlers}
            nodeTags={tags}
          ></ArticleViewerMemo>
        ))}
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
        <div ref={bottomRef}></div>
      </Space>
      <div className="float-menus">
        <ArticleListSummary></ArticleListSummary>
        {
          articleTags && articleTags.length ? <Button onClick={() => setShowFilter(true)} type="default" size="large" shape="circle" icon={<SearchOutlined />} />
            : null
        }
        {/* <Button onClick={() => {
          if (subjectTreeRef && subjectTreeRef.current) {
            subjectTreeRef.current.focus();
          }
        }} type="default" size="large" shape="circle" icon={<UnorderedListOutlined />} /> */}
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
      <Drawer closable={false} className={classNames(generateRandomStyle(), "filter-panel")} height="80%" visible={showFilter} placement="bottom" onClose={() => setShowFilter(false)}>
        <Space className="filters" direction="vertical">

          {articleTags.map((tag, i) => (
            <Radio.Group
              className="tag-list"
              key={tag.name}
              defaultValue={tag.value}
              buttonStyle="solid"
              onChange={(e) => updateTagValue(i, tag, e.target.value)}

            >
              <Radio.Button className="tag-item" value={undefined}>
                {'全部'}
              </Radio.Button>
              {...tag.values.map((value) => (
                <Radio.Button className="tag-item" key={value} value={value}>
                  {value}
                </Radio.Button>
              ))}
            </Radio.Group>
          ))}
          <div className="filter-menus">
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={() => {
                setShowFilter(false)
                fetchArticles(1);
              }}
            >{langs.get(LangKeys.Ok)}</Button>

            <Button
              type="primary"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setShowFilter(false)
              }}
            >{langs.get(LangKeys.Cancle)}</Button>
          </div>
        </Space>
      </Drawer>
    </div>
  )
}
