import './ArticleList.less'
import { ArrowLeftOutlined, DownloadOutlined, PrinterOutlined, PicRightOutlined, BorderBottomOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import { Button } from 'antd'
import { useMagicSeed, useServicesLocate, useUser } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'
import { generateRandomStyle } from './common'
import sleep from '../../infrac/Lang/sleep'
import IAnkiItemsExporter from '../../domain/ServiceInterfaces/IAnkiItemsExporter'
// eslint-disable-next-line import/no-webpack-loader-syntax
import ankiCss from '!!raw-loader!./ManageWords.Anki.css'
// eslint-disable-next-line camelcase
import { yyyyMMdd_HHmmss } from '../../infrac/Lang/DateUtils'
import { FieldInfo } from '../../domain/ServiceInterfaces/IItemsExporter'

const maxColumn = 3
const maxBorderStyle = 4

const ColumnCountKey = 'ARTICLES_COLUMN_COUNT'

const BorderStyleKey = 'ARTICLES_BORDER_STYLE'

const HideIndexKey = 'ARTICLES_HIDE_INDEX'

export default function ArticleList() {
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const user = useUser()
  const viewService = locate(IViewService)
  const articleListService = locate(IArticleListService)
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
  const magicSeed = useMagicSeed()
  const fetchArticles = async () => {
    viewService.setLoading(true)
    try {
      let all = articleListService.all()
      let count = 0
      if (all.length) {
        await Promise.all(all.filter(a => a[1].articleType.loadAdditionalsSync).map(a => a[0]).filter(a => a.lazyLoadingAddition).map(a => a.lazyLoadingAddition!().then(() => {
          setItems([...all])
        })))
        setItems(all)
        viewService.setLoading(false)
        return
      }
      const maxCount = parseInt(await locate(IConfigsService).getValueOrDefault(ConfigKeys.MAX_PRINT_COUNT))
      if (isNaN(maxCount)) {
        [count, all] = await articleListService.getArticles()
      } else {
        [count, all] = await articleListService.getArticles(0, maxCount)
      }
      setItems(all)
      await Promise.all(all.map(async ([a, t]) => {
        const tasks = []
        if (a.lazyLoading) {
          tasks.push(a.lazyLoading())
        }
        if (t.articleType.loadAdditionalsSync && a.lazyLoadingAddition) {
          tasks.push(a.lazyLoadingAddition())
        }
        if (tasks.length) {
          return Promise.all(tasks).then(() => {
            setItems([...all])
          })
        }
      }))
      viewService.setLoading(false)
    } catch (e) {
      viewService!.errorKey(locate(ILangsService), e.message)
      viewService.setLoading(false)
    }
  }
  const smallScreen = window.matchMedia && window.matchMedia('(max-width: 780px)')?.matches
  const [columnCount, setColumnCount] = useState(1)
  const [store] = useState<{ url?: string }>({})
  const [borderStyle, setBorderStyle] = useState(0)
  const [hideIdx, setHideIdx] = useState(false)
  const configsService = locate(IUserConfigsService)
  const loadConfigs = async () => {
    viewService.setLoading(true)
    const columnCount = await configsService.getOrDefault(ColumnCountKey, (smallScreen ? 1 : 2))
    const borderStyle = await configsService.getOrDefault(BorderStyleKey, 0)
    const hideIdx = await configsService.getOrDefault(HideIndexKey, false)
    setColumnCount(columnCount)
    setBorderStyle(borderStyle)
    setHideIdx(hideIdx)
    viewService.setLoading(false)
  }
  useEffect(() => {
    loadConfigs().then(() => {
      fetchArticles()
    })
  }, [])
  const ref = React.createRef<HTMLDivElement>()
  const close = () => {
    locate(IViewService).previewArticleList(false)
  }
  useEffect(() => {
    viewService.setFloatingMenus?.(ArticleList.name, <>
      {
        <Button type="primary" shape="circle" size="large" icon={<PictureOutlined />} onClick={() => {
          (document.scrollingElement as HTMLElement).scrollTo({ top: 0, behavior: undefined })
          locate(IViewService).captureElement(ref.current!)
        }} />
      }
      {
        user.editingPermission ?
          <Button
            icon={<DownloadOutlined />}
            type="primary" shape="circle" size="large"
            onClick={() => {
              const typeEnum = [LangKeys.Anki].map(s => langs.get(s))
              const tryExport = async (typeFilter: string) => {
                let a: HTMLAnchorElement
                let filename: string
                try {
                  viewService.setLoading(true)
                  let exporter
                  let exporterOpt
                  const typeIdx = typeEnum.indexOf(typeFilter)
                  switch (typeIdx) {
                    case 0:
                      exporter = locate(IAnkiItemsExporter)
                      exporterOpt = {
                        front: '<div class="front">{{Front}}</div>',
                        back: '{{FrontSide}}\n\n<hr id="answer">\n\n<div class="back">{{Back}}</div>',
                        css: ankiCss
                      }
                      break
                    default:
                      return
                  }
                  const fields: FieldInfo<{ article: [Article, ArticleContentType] }>[] = [
                    {
                      name: langs.get(LangKeys.Name),
                      get: ({ article }: { article: [Article, ArticleContentType] }) => article[0].name!
                    }
                  ]
                  const siteName = await locate(IConfigsService).getValueOrDefault(ConfigKeys.WEB_SITE_NAME)
                  const name = `${siteName}_${langs.get(LangKeys.FavoriteWords)}_${yyyyMMdd_HHmmss(new Date())}`
                  const buffer = await (exporter.export as any)(name, items, fields, exporterOpt)
                  filename = `${name}.${exporter.ext}`
                  a = document.createElement('a')
                  a.target = '_blank'
                  a.download = filename
                  if (store.url) {
                    URL.revokeObjectURL(store.url)
                  }
                  store.url = URL.createObjectURL(new Blob([buffer], { type: 'application/octet-stream' }))
                  a.href = store.url!
                  try {
                    a.click()
                    return
                  } catch (e) {
                    // ignore
                  }
                } catch (e) {
                  viewService!.errorKey(langs, e.message)
                  return
                } finally {
                  viewService.setLoading(false)
                }

                locate(IViewService).prompt(langs.get(LangKeys.ExportComplete), [
                ], async () => {
                  a.click()
                  return true
                })
              }
              locate(IViewService).prompt(langs.get(LangKeys.Export), [
                {
                  hint: langs.get(LangKeys.Type),
                  type: 'Enum',
                  value: typeEnum[0],
                  values: typeEnum
                }
              ], async (typeFilter: string) => {
                (() => {
                  tryExport(typeFilter)
                })()
                return true
              })
            }}
          >
          </Button>
          : undefined
      }
    </>,
      <Button type="primary" shape="circle" size="large" icon={<PrinterOutlined />} onClick={() => window.print()} />
    )
  })
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ArticleList.name)
    }
  }, [])
  return (
    <div className="article-list-wraper">
      <div className="article-list-menus" onClick={e => e.stopPropagation()}>
        <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} />
        <span className="spilter"></span>
        <Button type="link" size="large" icon={<OrderedListOutlined />} onClick={() => {
          const next = !hideIdx
          setHideIdx(next)
          configsService.set(HideIndexKey, next)
        }} />
        <Button type="link" size="large" icon={<PicRightOutlined />} onClick={() => {
          const next = ((columnCount) % maxColumn) + 1
          setColumnCount(next)
          configsService.set(ColumnCountKey, next)
        }} />
        <Button type="link" size="large" icon={<BorderBottomOutlined />} onClick={() => {
          const next = ((borderStyle) % maxBorderStyle) + 1
          setBorderStyle(next)
          configsService.set(BorderStyleKey, next)
        }} />
      </div>
      <div ref={ref} className={classNames(`column-count-${columnCount}`, !hideIdx ? 'show-idx' : '', `border-style-${borderStyle}`, 'article-list')}>{items.filter(([article]) => article.content && article.content.sections).map(
        ([article, type]) =>
          article.lazyLoading ? <div key={article.name + '_ept'}></div>
            : <type.Viewer articleId={article.id!} title={article.name} key={article.name} showTitle={!type.noTitle} print={true} className={classNames("article", borderStyle == 4 ? generateRandomStyle(article.name!, magicSeed) : '')} content={article.content!} files={article.files} type={type}></type.Viewer>
      )}
      </div>
    </div>
  )
}
