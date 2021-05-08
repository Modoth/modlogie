import './ArticleList.less'
import { ArrowLeftOutlined, PrinterOutlined, PicRightOutlined, BorderBottomOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import { Button } from 'antd'
import { useServicesLocate } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'

const maxColumn = 3
const maxBorderStyle = 4

const ColumnCountKey = 'ARTICLES_COLUMN_COUNT'

const BorderStyleKey = 'ARTICLES_BORDER_STYLE'

const ShowIndexKey = 'ARTICLES_SHOW_INDEX'

export default function ArticleList () {
  const locate = useServicesLocate()
  const viewService = locate(IViewService)
  const articleListService = locate(IArticleListService)
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
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
  const [borderStyle, setBorderStyle] = useState(0)
  const [showIdx, setShowIdx] = useState(false)
  const configsService = locate(IUserConfigsService)
  const loadConfigs = async () => {
    const columnCount = await configsService.getOrDefault(ColumnCountKey, (smallScreen ? 1 : 2))
    const borderStyle = await configsService.getOrDefault(BorderStyleKey, 0)
    const showIdx = await configsService.getOrDefault(ShowIndexKey, false)
    setColumnCount(columnCount)
    setBorderStyle(borderStyle)
    setShowIdx(showIdx)
  }
  useEffect(() => {
    loadConfigs()
    fetchArticles()
  }, [])
  const ref = React.createRef<HTMLDivElement>()
  const close = () => {
    locate(IViewService).previewArticleList(false)
  }
  useEffect(() => {
    viewService.setFloatingMenus?.(ArticleList.name, <></>)
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
          const next = !showIdx
          setShowIdx(next)
          configsService.set(ShowIndexKey, next)
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
        {
          <Button type="link" size="large" icon={<PictureOutlined />} onClick={() => {
            (document.scrollingElement as HTMLElement).scrollTo({ top: 0, behavior: undefined })
            locate(IViewService).captureElement(ref.current!)
          }} />
        }
        <Button type="link" size="large" icon={<PrinterOutlined />} onClick={() => window.print()} />
      </div>
      <div ref={ref} className={classNames(`column-count-${columnCount}`, showIdx ? 'show-idx' : '', `border-style-${borderStyle}`, 'article-list')}>{items.filter(([article]) => article.content && article.content.sections).map(
        ([article, type]) =>
          article.lazyLoading ? <div key={article.name + '_ept'}></div>
            : <type.Viewer articleId={article.id!} title={article.name} key={article.name} showTitle={!type.noTitle} print={true} className="article" content={article.content!} files={article.files} type={type}></type.Viewer>
      )}
      </div>
    </div>
  )
}
