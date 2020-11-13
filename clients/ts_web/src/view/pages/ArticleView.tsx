import './ArticleView.less'
import { ArticleType, ArticleContentEditorCallbacks, ArticleContentType } from '../../pluginbase/IPluginInfo'
import { Card, Button, Select, TreeSelect, Badge, Menu, DatePicker, Collapse } from 'antd'
import { Tag } from '../../domain/ServiceInterfaces/ITagsService'
import { useUser, useServicesLocator } from '../common/Contexts'
import {
  UploadOutlined,
  CheckOutlined,
  EditOutlined,
  PrinterFilled,
  UpSquareOutlined,
  UpSquareFilled,
  HeartOutlined,
  HeartFilled,
  LikeOutlined,
  DislikeOutlined,
  ExpandOutlined,
  PrinterOutlined,
  CaretLeftOutlined,
  QrcodeOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import Article, { ArticleContent, ArticleTag, ArticleAdditionalType } from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFavoritesServer from '../../domain/ServiceInterfaces/IFavoritesServer'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ILikesService from '../../domain/ServiceInterfaces/ILikesService'
import IViewService from '../../app/Interfaces/IViewService'
import MenuItem from 'antd/lib/menu/MenuItem'
import moment from 'moment'
import React, { useState, useEffect } from 'react'
import SubjectViewModel from './SubjectViewModel'
const { Panel } = Collapse

const { Option } = Select

const generateNewFileNames = (name: string, existedName: Set<string>) => {
  while (existedName.has(name)) {
    const match = name.match(/^(.*?)(_(\d*))?(\.\w*)$/)
    if (match) {
      name = match[1] + '_' + ((parseInt(match[3]) || 0) + 1) + match[4]
    } else {
      return name
    }
  }
  return name
}

export default function ArticleView (props: {
  article: Article;
  articleHandlers: { onDelete: { (id: string): void }, editingArticle?: Article };
  type: ArticleType;
  subjects: SubjectViewModel[];
  tags: ArticleTag[];
  nodeTags: Map<string, Tag>,
  recommendView?: boolean,
}) {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const articleListService = locator.locate(IArticleListService)
  const [files, setFiles] = useState(props.article.files)
  const [tagsDict, setTagsDict] = useState(props.article.tagsDict)
  const [subjectId, setSubjectId] = useState(props.article.subjectId)
  const [loaded, setLoaded] = useState(props.article.lazyLoading === undefined)
  const [additionalLoaded, setAdditionalLoaded] = useState(props.article.lazyLoadingAddition === undefined)
  const [editing, setEditing] = useState(props.articleHandlers.editingArticle === props.article)
  const [editorRefs, setEditorRefs] = useState<ArticleContentEditorCallbacks<ArticleContent>>(
    {} as any
  )
  const [type, setType] = useState<ArticleContentType | undefined>(undefined)
  const [inArticleList, setInArticleList] = useState(articleListService.has(props.article))
  const [content, setContent] = useState(props.article.content || {})
  const [published, setPublished] = useState(props.article.published)
  const [name, setName] = useState(props.article.name)
  const [favoriteService] = useState(locator.locate(IFavoritesServer))
  const [favorite, setFavorite] = useState(false)
  const [likesService, setLikesService] = useState<ILikesService | undefined>(undefined)
  const [canLike, setCanLike] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [canDislike, setCanDislike] = useState(false)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [recommendView, setRecommendView] = useState(props.recommendView || false)
  const [recommend, setRecommend] = useState(props.article.additionalType === ArticleAdditionalType.Recommend)
  const [recommendTitle, setRecommendTitle] = useState('')

  const addFile = (file?: File) => {
    viewService.prompt(
      langs.get(LangKeys.Import),
      [
        {
          type: 'File',
          value: file
        }
      ],
      async (file: File) => {
        try {
          viewService.setLoading(true)
          const fileService = locator.locate(IArticleService)
          const articleService = locator.locate(IArticleService)
          const [id, url] = await fileService.addFile(props.article.id!, file.type, new Uint8Array(await file.arrayBuffer()))
          const newFiles = [...(files || [])]
          const newFileName = generateNewFileNames(file.name, new Set(newFiles.map(f => f.name!)))
          const newFile = { name: newFileName, id, url }
          newFiles.push(newFile)
          await articleService.updateArticleContent(
            props.article,
            content,
            type?.additionalSections,
            newFiles
          )
          setFiles(newFiles)
          editorRefs && editorRefs.addFile(newFile)
          viewService.setLoading(false)
          return true
        } catch (e) {
          viewService.setLoading(false)
          viewService!.errorKey(langs, e.message)
          return false
        }
      }
    )
  }

  const updateSubjectId = async (sid: string) => {
    const api = locator.locate(IArticleService)
    try {
      await api.move(props.article.id!, sid)
      setSubjectId(sid)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const toggleEditing = async () => {
    if (!editing) {
      if (!additionalLoaded) {
        viewService.setLoading(true)
        await props.article.lazyLoadingAddition!()
        setContent(props.article.content!)
        setAdditionalLoaded(true)
        viewService.setLoading(false)
      }
      setEditing(true)
      return
    }
    try {
      const service = locator.locate(IArticleService)
      const newContent = editorRefs.getEditedContent()
      if (
        newContent.sections !== undefined &&
        newContent.sections !== content?.sections
      ) {
        await service.updateArticleContent(props.article, newContent, type?.additionalSections, files)
        setContent(newContent)
      }
      setEditing(false)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const updateTag = async (tag: ArticleTag, tagValue: string) => {
    const service = locator.locate(IArticleService)
    try {
      await service.updateTags(props.article.id!, { id: tag.id!, value: tagValue })
      const newTags = tagsDict || new Map()
      let newTag: ArticleTag
      if (!newTags.has(tag.name)) {
        newTag = {
          id: tag.id,
          name: tag.name,
          // type: NodeTag.TypeEnum.Enum,
          value: tagValue,
          values: tag.values
        }
        newTags.set(tag.name, newTag)
      } else {
        newTag = newTags.get(tag.name)
        newTag!.value = tagValue
      }
      if (tagsDict) {
        tagsDict.set(newTag.name!, newTag)
      }
      if (newTag.name === props.type.subTypeTag) {
        setType(await locator.locate(IArticleAppservice)
          .getArticleType(locator.locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined))
      }
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const updateArticleName = () => {
    viewService.prompt(
      langs.get(LangKeys.Modify),
      [
        {
          type: 'Text',
          value: name,
          hint: langs.get(LangKeys.Name)
        }
      ],
      async (newName: string) => {
        if (!newName) {
          return
        }
        const service = locator.locate(IArticleService)
        try {
          await service.rename(newName, props.article.id!)
        } catch (e) {
          viewService!.errorKey(langs, e.message)
          return
        }
        props.article.name = newName
        setName(newName)
        return true
      }
    )
  }
  // generateRandomStyle()
  useEffect(() => {
    if (!loaded) {
      if (props.type.loadAdditionalsSync && !additionalLoaded) {
        Promise.all([
          props.article.lazyLoading!(),
          props.article.lazyLoadingAddition!()
        ]).then(() => {
          setContent(props.article.content!)
          setFiles(props.article.files!)
          setAdditionalLoaded(true)
          setLoaded(true)
        })
      } else {
        props.article.lazyLoading!().then(() => {
          setContent(props.article.content!)
          setFiles(props.article.files!)
          setLoaded(true)
        })
      }
    }
    if (favoriteService) {
      favoriteService.has(props.type.name, props.article.id!).then(f => {
        if (f !== favorite) {
          setFavorite(f)
        }
      })
    }
    (async () => {
      const recommendTitle = (await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.RECOMMENT_TITLE))?.trim()
      if (recommendTitle) {
        setRecommendTitle(recommendTitle)
      }
    })();
    (async () => {
      const likesService = locator.locate(ILikesService)
      if (likesService) {
        const enablded = await likesService.enabled()
        if (!enablded) {
          return
        }
        const canLike = await likesService.canLike(props.article.id!)
        const canDislike = await likesService.canDislike(props.article.id!)
        const likeCount = canLike ? await likesService.likeCount(props.article) : 0
        const dislikeCount = canDislike ? await likesService.dislikeCount(props.article) : 0
        setLikesService(likesService)
        setCanLike(canLike)
        setCanDislike(canDislike)
        setLikeCount(likeCount)
        setDislikeCount(dislikeCount)
      }
    })()
    locator.locate(IArticleAppservice)
      .getArticleType(locator.locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined).then(type => setType(type))
  }, [])
  if (!type) {
    return <></>
  }
  const toogleRecommend = async () => {
    const next = !recommend
    try {
      await locator.locate(IArticleService).updateAdditionalType(props.article.id!, next ? ArticleAdditionalType.Recommend : ArticleAdditionalType.Normal)
      setRecommend(next)
    } catch (e) {
      viewService.errorKey(langs, e.message)
    }
  }
  const hasMore = props.article.additionId || (type && type.smartHiddenSections && type.smartHiddenSections.size)
  const openQrCode = async () => {
    const url = `${window.location.protocol}//${window.location.host}/#/article${props.article.path}`
    viewService.prompt({ title: (!props.type.noTitle && name) || langs.get(LangKeys.QrCode), subTitle: locator.locate(ILangsService).get(LangKeys.ComfireJump) + url }, [{
      type: 'QrCode',
      value: url
    }], async () => {
      window.location.href = url
      return true
    })
  }

  const openDetail = async () => {
    // if (!hasMore) {
    //   return
    // }
    if (!additionalLoaded) {
      viewService.setLoading(true)
      await props.article.lazyLoadingAddition!()
      setContent(props.article.content!)
      setAdditionalLoaded(true)
      viewService.setLoading(false)
    }
    locator.locate(IViewService).previewArticle(Object.assign({}, props.article, { name, content, files }), type)
  }
  const toogleFavorite = async () => {
    try {
      const nextFav = !favorite
      if (nextFav) {
        await favoriteService.add(props.type.name, props.article.id!)
      } else {
        await favoriteService.remove(props.type.name, props.article.id!)
      }
      setFavorite(nextFav)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const touchLike = async () => {
    if (!canLike) {
      viewService.errorKey(langs, LangKeys.AlreadyLiked)
      return
    }
    try {
      await likesService?.addLike(props.article.id!)
      setLikeCount((likeCount || 0) + 1)
      setCanDislike(false)
      setCanLike(false)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const touchDislike = async () => {
    if (!canDislike) {
      viewService.errorKey(langs, LangKeys.AlreadyLiked)
      return
    }
    try {
      await likesService?.addDislike(props.article.id!)
      setDislikeCount((dislikeCount || 0) + 1)
      setCanLike(false)
      setCanDislike(false)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const shortNumber = (num: number): string => {
    const s = num.toString()
    const max = 3
    if (s.length < max) {
      return s
    }
    const h = Math.floor(num / Math.pow(10, s.length - 1))
    return `${h}${['', '', '', 'k', '0k', '00k'][s.length - max + 1]}+`
  }
  return (
    <Card className={classNames('article-view', recommendView ? '' : '')}>
      <div className="article-title">
        {recommendView && recommendTitle ? <Button className="recommend-button" danger type="link" >{recommendTitle}</Button> : <span></span>
        }{props.type.noTitle ? <div className="empty-title" onClick={openDetail}></div> : <div onClick={(user.editingPermission && !props.type.noTitle) ? updateArticleName : openDetail}>{name}</div>}
        {
          (editing || recommendView) ? null : (<Menu mode="horizontal" className={classNames('actions-list')}>{[
            favoriteService ? <MenuItem key="toogle-fav"><Badge>
              <Button onClick={toogleFavorite} type="link" icon={favorite ? < HeartFilled /> : <HeartOutlined />}
                key="favorite"><span className="action-name">{langs.get(LangKeys.Favorite)}</span></Button>
            </Badge></MenuItem> : null,
            user.printPermission ? (inArticleList
              ? <MenuItem key='remove-print'><Badge >
                <Button type="link" icon={<PrinterFilled />} onClick={() => {
                  articleListService.remove(props.article)
                  setInArticleList(articleListService.has(props.article))
                }}
                key={LangKeys.RemoveFromArticleList}><span className="action-name">{langs.get(LangKeys.RemoveFromArticleList)}</span></Button>
              </Badge></MenuItem>
              : <MenuItem key="add-print"><Badge className="printer-icons">
                <Button type="link" icon={<PrinterOutlined />} onClick={() => {
                  articleListService.add(props.article, type, () => {
                    setInArticleList(false)
                  })
                  setInArticleList(articleListService.has(props.article))
                }}
                key={LangKeys.AddToArticleList}><span className="action-name">{langs.get(LangKeys.AddToArticleList)}</span></Button>
              </Badge></MenuItem>
            ) : null,
            ...(likesService ? [<MenuItem key="like"><Badge count={likeCount ? <span className="icon-badges" >{shortNumber(likeCount)}</span> : null}>
              <Button onClick={touchLike} type="link" icon={<LikeOutlined />}
              ><span className="action-name">{langs.get(LangKeys.Like) + (likeCount ? ` (${likeCount})` : '')}</span></Button></Badge></MenuItem>,
            <MenuItem key="dislike"><Badge count={dislikeCount ? <span className="icon-badges" >{shortNumber(dislikeCount)}</span> : null}><Button onClick={touchDislike} type="link" icon={<DislikeOutlined />}
            ><span className="action-name">{langs.get(LangKeys.Dislike) + (dislikeCount ? ` (${dislikeCount})` : '')}</span></Button></Badge></MenuItem>] : []),
            <MenuItem key="qrcode"><Button type="link" icon={<QrcodeOutlined />} onClick={openQrCode}
            ><span className="action-name">{langs.get(LangKeys.QrCode)}</span></Button></MenuItem>,
            ...(user.editingPermission ? [
              <MenuItem key="recommend"> <Button type="link" icon={recommend ? <UpSquareFilled /> : <UpSquareOutlined />} onClick={toogleRecommend}
              ><span className="action-name">{recommend ? langs.get(LangKeys.CancleRecommend) : langs.get(LangKeys.Recommend)}</span></Button></MenuItem>,
              <MenuItem key="edit"> <Button type="link" icon={<EditOutlined />} onClick={toggleEditing}
              ><span className="action-name">{langs.get(LangKeys.Edit)}</span></Button></MenuItem>,
              <MenuItem key="fullscreen"><Button type="link" icon={<ExpandOutlined />} onClick={openDetail}
              ><span className="action-name">{langs.get(LangKeys.Detail)}</span></Button></MenuItem>,
              <MenuItem key="delete"><Button type="link" danger icon={<DeleteOutlined />} onClick={() =>
                props.articleHandlers.onDelete(props.article.id!)
              } ><span className="action-name">{langs.get(LangKeys.Delete)}</span></Button></MenuItem>
            ] : [])]}
          </Menu>)
        }
      </div>{
        loaded ? <div className="article-body">
          {editing ? (
            <>
              <props.type.Editor
                onpaste={addFile}
                content={content}
                files={files}
                callbacks={editorRefs}
                type={type}
                articleId = {props.article.id!}
              />
              <Collapse className={classNames('editing-preview')} >
                <Panel header={
                  <div className="preview-title-panel">
                    <span className="preview-title">{langs.get(LangKeys.Edit) + ': ' + (name || '')}</span>
                    <Button
                      type="link"
                      onClick={toggleEditing}
                      key="endEdit"
                      icon={<CheckOutlined />}
                    ></Button>,
                    <Button
                      type="link"
                      icon={<UploadOutlined />}
                      onClick={() => addFile()}
                    ></Button>
                  </div>} key="1">
                  <props.type.Viewer articleId={props.article.id!} showAdditionals={true} content={content} files={files} type={type} />
                </Panel>
              </Collapse>
            </>
          ) : (
            <props.type.Viewer articleId={props.article.id!} content={content} files={files} type={type} />
          )}
          {
            (hasMore) ? <div className="show-more"><Button type="link" size="small" icon={<CaretLeftOutlined />} onClick={openDetail}></Button></div> : null
          }
        </div> : <div className="article-body"></div>
      }
      {
        editing ? (<div className="actions-tags-list">{[
          <TreeSelect
            key="subject"
            onChange={updateSubjectId}
            defaultValue={subjectId}
            treeData={props.subjects}
            placeholder={langs.get(LangKeys.Subject)}
          />,
          ...props.tags.map((tag) => (
            <Select
              key={tag.name}
              onChange={(value) => updateTag(tag, value)}
              defaultValue={
                tagsDict?.get(tag.name)?.value || `(${tag.name})`
              }
            >
              <Option value={undefined!}>{`(${tag.name})`}</Option>
              {...tag.values.map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
            </Select>
          ))
        ]}
        <DatePicker showToday={true} clearIcon={false} value={moment(published)} onChange={async e => {
          try {
            const date = e!.toDate()
            await locator.locate(IArticleService).updatePublished(props.article.id!, date)
            setPublished(date)
            return true
          } catch (e) {
              viewService!.errorKey(langs, e.message)
          }
        }} />
        </div>) : null
      }
      {
        editing ? (
          <>
            <div className="files-list">
              <Button
                type="link"
                onClick={toggleEditing}
                key="endEdit"
                icon={<CheckOutlined />}
              >{langs.get(LangKeys.Ok)}</Button>,
              <Button
                type="link"
                icon={<UploadOutlined />}
                onClick={() => addFile()}
              >{langs.get(LangKeys.Import)}</Button>
              {/* {files?.length
              ? files!.map((file) => (
                <ArticleFileViewer
                  key={file.url}
                  file={file}
                  onClick={() => editorRefs.addFile(file)}
                  onDelete={() => deleteFile(file)}
                ></ArticleFileViewer>
              ))
              : null} */}
            </div>
          </>
        ) : null
      }
    </Card >
  )
}
