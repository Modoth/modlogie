import './ArticleView.less'
import { ArticleType, ArticleContentEditorCallbacks, ArticleContentType, ArticleContentViewerProps } from '../../pluginbase/IPluginInfo'
import { Card, Button, Select, TreeSelect, Badge, Menu, DatePicker, Collapse, Radio } from 'antd'
import { generateRandomStyle } from './common'
import { IPublishService } from '../../domain/ServiceInterfaces/IPublishService'
import { Tag } from '../../domain/ServiceInterfaces/ITagsService'
import { UploadOutlined, CloseOutlined, ShareAltOutlined, SaveOutlined, CheckOutlined, EditOutlined, FontColorsOutlined, PrinterFilled, UpSquareOutlined, UpSquareFilled, HeartOutlined, HeartFilled, LikeOutlined, DislikeOutlined, ExpandOutlined, PrinterOutlined, CaretLeftOutlined, QrcodeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useUser, useServicesLocate, useMagicSeed } from '../common/Contexts'
import Article, { ArticleContent, ArticleTag, ArticleAdditionalType, ArticleWeights } from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import defaultLogo from '../assets/logo.png'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IArticleService from '../../domain/ServiceInterfaces/IArticleService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFavoritesService from '../../domain/ServiceInterfaces/IFavoritesService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ILikesService from '../../domain/ServiceInterfaces/ILikesService'
import IViewService from '../../app/Interfaces/IViewService'
import MenuItem from 'antd/lib/menu/MenuItem'
import moment from 'moment'
import PublishArticle from './PublishArticle'
import QrCode from '../../infrac/components/QrCode'
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

const getAutoUpdaters = (publishGenerators?: Map<string, {
  generator: (props: ArticleContentViewerProps) => string;
  previewTemplate?: string | undefined;
  autoUpdate?: boolean | undefined;
}>) => {
  var updaters :{name:string, generator: (props: ArticleContentViewerProps) => string } [] = []
  if (publishGenerators) {
    publishGenerators.forEach(({ generator, autoUpdate }, name) => {
      if (autoUpdate) { updaters.push({ name, generator }) }
    })
  }
  return updaters
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
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const [logo, setLogo] = useState('')
  const ref = React.createRef<HTMLDivElement>()
  const titleRef = React.createRef<HTMLDivElement>()
  const viewService = locate(IViewService)
  const articleListService = locate(IArticleListService)
  const [files, setFiles] = useState(props.article.files)
  const [publishedIds, setPublishedIds] = useState(props.article.publishedIds)
  const [tagsDict, setTagsDict] = useState(props.article.tagsDict)
  const [subjectId, setSubjectId] = useState(props.article.subjectId)
  const [loaded, setLoaded] = useState(props.article.lazyLoading === undefined)
  const [additionalLoaded, setAdditionalLoaded] = useState(props.article.lazyLoadingAddition === undefined)
  const [editing, setEditing] = useState(props.articleHandlers.editingArticle === props.article)
  const [editorRefs, setEditorRefs] = useState<ArticleContentEditorCallbacks<[ArticleContent, Set<string>]>>(
    {} as any
  )
  const [type, setType] = useState<ArticleContentType | undefined>(undefined)
  const [inArticleList, setInArticleList] = useState(articleListService.has(props.article))
  const [content, setContent] = useState(props.article.content || {})
  const [published, setPublished] = useState(props.article.published)
  const [name, setName] = useState(props.article.name)
  const [favoriteService] = useState(locate(IFavoritesService))
  const [favorite, setFavorite] = useState(false)
  const [likesService, setLikesService] = useState<ILikesService | undefined>(undefined)
  const [canLike, setCanLike] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [canDislike, setCanDislike] = useState(false)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [showFloat, setShowFloat] = useState(false)
  const [recommendView, setRecommendView] = useState(props.recommendView || false)
  const [recommend, setRecommend] = useState(props.article.additionalType === ArticleAdditionalType.Recommend)
  const [recommendTitle, setRecommendTitle] = useState('')
  const [autoUpdaters] = useState(() => getAutoUpdaters(props.type.publishGenerators))
  const [privateOptions] = useState<{label:string, value: boolean|undefined}[]>([
    { label: langs.get(LangKeys.Default), value: undefined },
    { label: langs.get(LangKeys.Private), value: true },
    { label: langs.get(LangKeys.Public), value: false }
  ])
  const [defaultPrivate, setDefaultPrivate] = useState(false)
  const [floatLeft, setFloatLeft] = useState(0)
  const [floatTop, setFloatTop] = useState(0)
  const magicSeed = useMagicSeed()
  const [privateType, setPrivateType] = useState<boolean|undefined>(props.article.private)
  const privateChanged = async (e:any) => {
    const p = e.target.value
    const api = locate(IArticleService)
    try {
      await api.updatePrivate(props.article.id!, p)
      setPrivateType(p)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const autoUpdate = async () => {
    if (autoUpdaters && autoUpdaters.length) {
      const publishService = locate(IPublishService)
      var newPublishIds = new Map(publishedIds || [])

      for (const { name, generator } of autoUpdaters) {
        if (publishedIds?.has(name)) {
          const id = await publishService.publish(name, props.article.id!, props.type.displayName || props.type.name,
            `${window.location.protocol}//${window.location.host}`,
            `/#/article/${props.article.path!}`,
            generator({ files, content, articleId: props.article.id!, type })
          )
          if (id) {
            newPublishIds.set(name, id)
          } else {
            newPublishIds.delete(name)
          }
        }
        setPublishedIds(newPublishIds)
      }
    }
  }
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
          const fileService = locate(IArticleService)
          const articleService = locate(IArticleService)
          const [id, url] = await fileService.addFile(props.article.id!, file.type?.split('+')?.[0], new Uint8Array(await file.arrayBuffer()))
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
          await autoUpdate()
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
    const api = locate(IArticleService)
    try {
      await api.move(props.article.id!, sid)
      setSubjectId(sid)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const save = async (close = false) => {
    try {
      const service = locate(IArticleService)
      const [newContent, newFileNames] = editorRefs.getEditedContent()
      if (
        newContent.sections !== undefined &&
        newContent.sections !== content?.sections
      ) {
        const newFiles = files?.filter(f => newFileNames.has(f.name!))
        await service.updateArticleContent(props.article, newContent, type?.additionalSections, newFiles)
        setContent(newContent)
        setFiles(newFiles)
        await autoUpdate()
      }
      if (close) {
        setEditing(false)
      }
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
    save(true)
  }

  const updateWeight = async (weight: number) => {
    const service = locate(IArticleService)
    try {
      await service.updateWeight(props.article.id!, weight || 0)
      props.article.weight = weight
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }

  const updateTag = async (tag: ArticleTag, tagValue: string) => {
    const service = locate(IArticleService)
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
        setType(await locate(IArticleAppservice)
          .getArticleType(locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined))
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
        const service = locate(IArticleService)
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
      const recommendTitle = (await locate(IConfigsService).getValueOrDefault(ConfigKeys.RECOMMENT_TITLE))?.trim()
      if (recommendTitle) {
        setRecommendTitle(recommendTitle)
      }
    })();
    (async () => {
      const logo = await locate(IConfigsService).getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo
      setLogo(logo)
    })();
    (async () => {
      const likesService = locate(ILikesService)
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
    if (user.editingPermission) {
      (async () => {
        const privateFile = await locate(IConfigsService).getValueOrDefaultBoolean(ConfigKeys.NEW_FILE_DEFAULT_PRIVATE)
        setDefaultPrivate(privateFile)
      })()
    }
    locate(IArticleAppservice)
      .getArticleType(locate(IConfigsService), props.type, props.type.subTypeTag ? tagsDict?.get(props.type.subTypeTag!)?.value : undefined).then(type => setType(type))
  }, [])
  if (!type) {
    return <></>
  }
  const toogleRecommend = async () => {
    const next = !recommend
    try {
      await locate(IArticleService).updateAdditionalType(props.article.id!, next ? ArticleAdditionalType.Recommend : ArticleAdditionalType.Normal)
      setRecommend(next)
    } catch (e) {
      viewService.errorKey(langs, e.message)
    }
  }
  const hasMore = props.article.additionId || (type && type.smartHiddenSections && type.smartHiddenSections.size)
  const openShare = () => {
    if (ref.current) {
      const offset = Math.min(window.innerHeight * 0.2, 120)
      const elementPos = ref.current.getBoundingClientRect()
      const left = (window.innerWidth) / 2 - (elementPos.right + elementPos.left) / 2
      const top = (window.innerHeight) / 2 - (elementPos.bottom + elementPos.top) / 2 - offset
      setFloatLeft(left)
      setFloatTop(top)
      setShowFloat(true)
    }
  }

  const tryLoadingAll = async () => {
    if (!additionalLoaded) {
      viewService.setLoading(true)
      await props.article.lazyLoadingAddition!()
      setContent(props.article.content!)
      setAdditionalLoaded(true)
      viewService.setLoading(false)
    }
  }

  const openDetail = async () => {
    // if (!hasMore) {
    //   return
    // }
    await tryLoadingAll()
    locate(IViewService).previewArticle(Object.assign({}, props.article, { name, content, files }), type)
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
  const openPublishDetail = async (publishName:string) => {
    const g = type.articleType.publishGenerators?.get(publishName)
    if (!g) {
      console.log('Generator not implemented.')
      return
    }
    const { generator, previewTemplate } = g
    await tryLoadingAll()
    const onPublishIdChanged = (p?:string) => {
      var newPublishIds = new Map(publishedIds || [])
      if (p) {
        newPublishIds.set(publishName, p)
      } else {
        newPublishIds.delete(publishName)
      }
      setPublishedIds(newPublishIds)
    }
    viewService.prompt(langs.get(publishName), [
      {
        type: 'View',
        value: <PublishArticle
          publishType={publishName}
          onPublishIdChanged={onPublishIdChanged}
          publishId={publishedIds && publishedIds.get(publishName)}
          articleId={props.article.id!}
          files={files}
          group={type.articleType.displayName || type.articleType.name}
          Template={generator}
          PreviewTemplate = {previewTemplate}
          content={content}
          type={type}
          articlePath={props.article.path!}></PublishArticle>
      }
    ], async () => true)
  }

  return (<>
    { showFloat ? <div className={classNames(showFloat ? 'float-article-bg' : '')} onClick={() => setShowFloat(false)}>
    </div> : undefined}
    <div ref={ref} className={classNames(showFloat ? 'float-article' : '')} style={{ left: floatLeft, top: floatTop }}>
      <Card className={classNames('article-view', recommendView ? '' : '', editing ? 'editing' : '', (privateType === true || (defaultPrivate && privateType === undefined)) ? 'private-article' : recommendView ? generateRandomStyle(props.article.id!, magicSeed) : '')}>
        <div className="article-title" ref={titleRef}>
          {recommendView && recommendTitle ? <Button className="recommend-button" danger type="link" >{recommendTitle}</Button> : <span></span>
          }{props.type.noTitle ? <div className="empty-title" onClick={openDetail}></div> : <div onClick={ openDetail}>{name}</div>}
          {
            (editing || recommendView) ? null : (<Menu onClick={({ key }: { key: string } | any) => {
              switch (key) {
                case 'toogle-fav':
                  toogleFavorite()
                  return
                case 'remove-print':
                  articleListService.remove(props.article)
                  setInArticleList(articleListService.has(props.article))
                  return
                case 'add-print':
                  articleListService.add(props.article, type, () => {
                    setInArticleList(false)
                  })
                  setInArticleList(articleListService.has(props.article))
                  return
                case 'qrcode':
                  setTimeout(() => {
                    openShare()
                  }, 50)
                  return
                case 'like':
                  touchLike()
                  return
                case 'dislike':
                  touchDislike()
                  return
                case 'recommend':
                  toogleRecommend()
                  return
                case 'rename':
                  updateArticleName()
                  return
                case 'edit':
                  toggleEditing()
                  return
                case 'fullscreen':
                  openDetail()
                  return
                case 'delete':
                  props.articleHandlers.onDelete(props.article.id!)
              }
            }} mode="horizontal" className={classNames('actions-list')}>{[
                favoriteService ? <MenuItem key="toogle-fav"><Badge>
                  <Button type="link" className="heart" danger={favorite} icon={ <HeartOutlined /> }
                    key="favorite"><span className="action-name">{langs.get(LangKeys.Favorite)}</span></Button>
                </Badge></MenuItem> : null,
                user.printPermission ? (inArticleList
                  ? <MenuItem key='remove-print'><Badge >
                    <Button type="link" danger icon={<PrinterOutlined />} key={LangKeys.RemoveFromArticleList}><span className="action-name">{langs.get(LangKeys.RemoveFromArticleList)}</span></Button>
                  </Badge></MenuItem>
                  : <MenuItem key="add-print"><Badge className="printer-icons">
                    <Button type="link" icon={<PrinterOutlined />} key={LangKeys.AddToArticleList}><span className="action-name">{langs.get(LangKeys.AddToArticleList)}</span></Button>
                  </Badge></MenuItem>
                ) : null,
                <MenuItem key="qrcode"><Button type="link" icon={<QrcodeOutlined />}
                ><span className="action-name">{langs.get(LangKeys.Share)}</span></Button></MenuItem>,
                ...(likesService ? [<MenuItem key="like"><Badge count={likeCount ? <span className="icon-badges" >{shortNumber(likeCount)}</span> : null}>
                  <Button type="link" icon={<LikeOutlined />}
                  ><span className="action-name">{langs.get(LangKeys.Like) + (likeCount ? ` (${likeCount})` : '')}</span></Button></Badge></MenuItem>,
                <MenuItem key="dislike"><Badge count={dislikeCount ? <span className="icon-badges" >{shortNumber(dislikeCount)}</span> : null}><Button type="link" icon={<DislikeOutlined />}
                ><span className="action-name">{langs.get(LangKeys.Dislike) + (dislikeCount ? ` (${dislikeCount})` : '')}</span></Button></Badge></MenuItem>] : []),
                ...(user.editingPermission ? [
                  <MenuItem key="recommend"> <Button type="link" icon={recommend ? <UpSquareFilled /> : <UpSquareOutlined />}
                  ><span className="action-name">{recommend ? langs.get(LangKeys.CancleRecommend) : langs.get(LangKeys.Recommend)}</span></Button></MenuItem>,
                  (!props.type.noTitle) ? <MenuItem key="rename"> <Button type="link" icon={ <FontColorsOutlined /> }
                  ><span className="action-name">{langs.get(LangKeys.Rename)}</span></Button></MenuItem> : undefined,
                  <MenuItem key="edit"> <Button type="link" icon={<EditOutlined />}
                  ><span className="action-name">{langs.get(LangKeys.Edit)}</span></Button></MenuItem>,
                  <MenuItem key="fullscreen"><Button type="link" icon={<ExpandOutlined />}
                  ><span className="action-name">{langs.get(LangKeys.Detail)}</span></Button></MenuItem>,
                  <MenuItem key="delete"><Button type="link" danger icon={<DeleteOutlined />} ><span className="action-name">{langs.get(LangKeys.Delete)}</span></Button></MenuItem>,
                  ...(type.articleType.publishGenerators && type.articleType.publishGenerators.size ? Array.from(type.articleType.publishGenerators, ([publishName]) =>
                    <MenuItem key={publishName}><Button type="link" danger={publishedIds?.has(publishName)} icon={<ShareAltOutlined />} onClick={() => openPublishDetail(publishName)}
                    ><span className="action-name">{langs.get(publishName)}</span></Button></MenuItem>
                  ) : []),
                  <MenuItem key="private"><Radio.Group options={privateOptions as any} onChange={privateChanged} value={privateType as boolean} /></MenuItem>
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
                        onClick={(e) => { e.stopPropagation(); save() }}
                        key="save"
                        icon={<SaveOutlined />}
                      ></Button>,
                      <Button
                        type="link"
                        icon={<UploadOutlined />}
                        onClick={(e) => { e.stopPropagation(); addFile() }}
                      ></Button>,
                      <Button
                        type="link"
                        onClick={(e) => { e.stopPropagation(); setEditing(false) }}
                        key="exit"
                        danger
                        icon={<CloseOutlined />}
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
          <Select
            onChange={(value) => updateWeight(value)}
            defaultValue={props.article.weight}>
            <Option value={0}>{`(${langs.get(LangKeys.Weight)})`}</Option>
              {...ArticleWeights.map((v) => (
                <Option key={v} value={v}>
                  {v}
                </Option>
              ))}
          </Select>
          <DatePicker showToday={true} clearIcon={false} value={moment(published)} onChange={async e => {
            try {
              const date = e!.toDate()
              await locate(IArticleService).updatePublished(props.article.id!, date)
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
      {(() => {
        if (!showFloat) {
          return
        }
        const url = `${window.location.protocol}//${window.location.host}/#/article${props.article.path}`
        return <><div className="share-panel">
          <QrCode content={url}></QrCode>
          <a href={url}>{url}</a>
        </div>
        </>
      })()}
    </div>
  </>)
}
