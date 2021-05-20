import './ArticleList.less'
import { ArrowLeftOutlined, ClearOutlined, DownloadOutlined, PrinterOutlined, PicRightOutlined, BorderBottomOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import { ArticleContentExporterProps, ArticleContentType, ArticleContentViewerProps } from '../../pluginbase/IPluginInfo'
import { Badge, Button } from 'antd'
import { FieldInfo } from '../../domain/ServiceInterfaces/IItemsExporter'
import { generateRandomStyle } from './common'
import { ScreenshotIcon } from '../common/Icons'
import { useMagicSeed, useServicesLocate, useUser } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IAnkiItemsExporter from '../../domain/ServiceInterfaces/IAnkiItemsExporter'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
// eslint-disable-next-line import/no-webpack-loader-syntax
import ankiCss from '!!raw-loader!./ArticleList.Anki.css'
// eslint-disable-next-line import/no-webpack-loader-syntax
import ankiClozeCss from '!!raw-loader!./ArticleList.AnkiCloze.css'
// eslint-disable-next-line camelcase
import { yyyyMMdd_HHmmss } from '../../infrac/Lang/DateUtils'
const maxColumn = 3
const maxBorderStyle = 4

const ColumnCountKey = 'ARTICLES_COLUMN_COUNT'

const BorderStyleKey = 'ARTICLES_BORDER_STYLE'

const HideIndexKey = 'ARTICLES_HIDE_INDEX'

const GeneratorNames = [LangKeys.Anki, LangKeys.AnkiCloze]

export default function ArticleList () {
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const user = useUser()
  const viewService = locate(IViewService)
  const articleListService = locate(IArticleListService)
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
  const [addCount, setAddCount] = useState(0)
  const [generators, setGenerators] = useState<Map<string, Map<ArticleContentType, {(props: ArticleContentExporterProps): string}>>>(new Map())
  const magicSeed = useMagicSeed()
  const updateGenerator = (all: [Article, ArticleContentType][]) => {
    const gNames = GeneratorNames
    const generators = new Map()
    for (const gname of gNames) {
      let generator: any = new Map<ArticleContentType, {(props: ArticleContentViewerProps): string }>()
      for (const [_, type] of all) {
        const g = type.articleType.exporterGenerators?.get(gname)?.generator
        if (!g) {
          generator = undefined
          break
        }
        generator.set(type, g)
      }
      if (generator) {
        generators.set(gname, generator)
      }
    }
    setGenerators(generators)
  }
  const fetchArticles = async () => {
    viewService.setLoading(true)
    try {
      let all = articleListService.all()
      let count = 0
      setAddCount(0)
      if (all.length) {
        await Promise.all(all.filter(a => a[1].articleType.loadAdditionalsSync).map(a => a[0]).filter(a => a.lazyLoadingAddition).map(a => a.lazyLoadingAddition!().then(() => {
          setItems([...all])
        })))
        setItems(all)
        updateGenerator(all)
        setAddCount(all.length)
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
      updateGenerator(all)
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
  const clear = () => {
    articleListService.clear()
    close()
  }
  useEffect(() => {
    viewService.setFloatingMenus?.(LangKeys.PageArticleList, <>
      {
        <Button type="primary" shape="circle" size="large" icon={<ScreenshotIcon />} onClick={() => {
          (document.scrollingElement as HTMLElement).scrollTo({ top: 0, behavior: undefined })
          locate(IViewService).captureElement(ref.current!)
        }} />
      }
      {
        generators.size
          ? <Button
            icon={<DownloadOutlined />}
            type="primary" shape="circle" size="large"
            onClick={() => {
              const typeEnum = Array.from(generators.keys(), s => langs.get(s))
              const tryExport = async (typeFilter: string) => {
                let a: HTMLAnchorElement
                let filename: string
                let fields: FieldInfo<[Article, ArticleContentType]>[]
                try {
                  viewService.setLoading(true)
                  let exporter
                  let exporterOpt
                  switch (typeFilter) {
                    case langs.get(LangKeys.Anki):
                      exporter = locate(IAnkiItemsExporter)
                      exporterOpt = {
                        front: '<div class="front">{{Front}}</div>',
                        back: '{{FrontSide}}\n\n<hr id="answer">\n\n<div class="back">{{Back}}</div>',
                        css: ankiCss
                      }
                      fields = [
                        {
                          name: langs.get(LangKeys.Name),
                          front: true,
                          get: ([article, type]: [Article, ArticleContentType]) => {
                            return [article.name!, undefined]
                          }
                        },
                        {
                          name: langs.get(LangKeys.Comment),
                          get: ([article, type]: [Article, ArticleContentType]) => {
                            const g = generators.get(LangKeys.Anki)?.get(type)
                            const resources: any = []
                            if (!g) {
                              return [undefined, undefined]
                            }
                            return [g({ content: article.content!, articleId: article.id!, resources }), resources]
                          }
                        }
                      ]
                      break
                    case langs.get(LangKeys.AnkiCloze):
                      exporter = locate(IAnkiItemsExporter)
                      exporterOpt = {
                        front: '<div class="front">{{cloze:Front}}</div>',
                        back: '<div class="front">{{cloze:Front}}</div><br><div class="back">{{Back}}</div>',
                        css: ankiClozeCss
                      }
                      fields = [
                        {
                          name: langs.get(LangKeys.Name),
                          front: true,
                          get: ([article, type]: [Article, ArticleContentType]) => {
                            return [article.name!, undefined]
                          }
                        },
                        {
                          name: langs.get(LangKeys.Comment),
                          front: true,
                          get: ([article, type]: [Article, ArticleContentType]) => {
                            const g = generators.get(LangKeys.AnkiCloze)?.get(type)
                            const resources: any = []
                            if (!g) {
                              return [undefined, undefined]
                            }
                            return [g({ content: article.content!, articleId: article.id!, resources }), resources]
                          }
                        }
                      ]
                      break
                    default:
                      return
                  }

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
    <>
      <Button type="primary" shape="circle" size="large" icon={<PrinterOutlined />} onClick={() => window.print()} />
      {
        addCount ? <Badge count={addCount}>
          <Button danger onClick={clear}type="primary" shape="circle" size="large" icon={<ClearOutlined />} />
        </Badge>
          : undefined
      }
    </>
    )
  })
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(LangKeys.PageArticleList)
    }
  }, [])
  return (
    <div className="article-list-wraper">
      <div className="article-list-menus" onClick={e => e.stopPropagation()}>
        <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} />
        <span className="title">{langs.get(LangKeys.ExportOrPrint)}</span>
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
            : <type.Viewer articleId={article.id!} title={article.name} key={article.name} showTitle={!type.noTitle} print={true} className={classNames('article', borderStyle === 4 ? generateRandomStyle(article.name!, magicSeed) : '')} content={article.content!} files={article.files} type={type}></type.Viewer>
      )}
      </div>
    </div>
  )
}
