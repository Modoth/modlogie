import React, { useState, useEffect } from 'react'
import './ArticleList.less'
import { useServicesLocator } from '../Contexts'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import { Button } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, PicRightOutlined, BorderBottomOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import Article from '../../domain/ServiceInterfaces/Article';
import { ArticleContentType } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../../app/Interfaces/IViewService';
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice';
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys';
import ILangsService from '../../domain/ServiceInterfaces/ILangsService';

const maxColumn = 3;
const maxBorderStyle = 4;

const getColumnCountKey = () => 'ARTICLES_COLUMN_COUNT'
const loadColumnCount = () => {
    let count = localStorage.getItem(getColumnCountKey())
    if (!count) {
        return 0
    }
    return parseInt(count) || 0
}
const saveColumnCount = (count: number) => {
    if (count) {
        localStorage.setItem(getColumnCountKey(), count.toString())
    } else {
        localStorage.removeItem(getColumnCountKey())
    }
}

const getBorderStyleKey = () => 'ARTICLES_BORDER_STYLE'
const loadBorderStyle = () => {
    let style = localStorage.getItem(getBorderStyleKey())
    if (!style) {
        return 0
    }
    return parseInt(style) || 0
}
const saveBorderStyle = (style: number) => {
    if (style) {
        localStorage.setItem(getBorderStyleKey(), style.toString())
    } else {
        localStorage.removeItem(getBorderStyleKey())
    }
}

const getShowIndexKey = () => 'ARTICLES_SHOW_INDEX'
const loadShowIndex = () => {
    let paging = localStorage.getItem(getShowIndexKey())
    return paging === 'true'
}
const saveShowIndex = (paging: boolean) => {
    if (paging) {
        localStorage.setItem(getShowIndexKey(), 'true')
    } else {
        localStorage.removeItem(getShowIndexKey())
    }
}

export default function ArticleList() {
    const locator = useServicesLocator()
    const viewService = locator.locate(IViewService)
    const articleListService = locator.locate(IArticleListService)
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
            let maxCount = parseInt(await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.MAX_PRINT_COUNT))
            if (isNaN(maxCount)) {
                [count, all] = await articleListService.getArticles();
            } else {
                [count, all] = await articleListService.getArticles(0, maxCount);
            }
            setItems(all);
            await Promise.all(all.map(async ([a, t]) => {
                let tasks = []
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
            viewService!.errorKey(locator.locate(ILangsService), e.message)
            viewService.setLoading(false)
        }
    }
    const smallScreen = window.matchMedia && window.matchMedia("(max-width: 780px)")?.matches
    const [columnCount, setColumnCount] = useState(loadColumnCount() || (smallScreen ? 1 : 2))
    const [borderStyle, setBorderStyle] = useState(loadBorderStyle() || maxBorderStyle)
    const [showIdx, setShowIdx] = useState(loadShowIndex() || false)
    useEffect(() => {
        fetchArticles()
    }, [])
    const ref = React.createRef<HTMLDivElement>()
    const close = () => {
        locator.locate(IViewService).previewArticleList(false)
    }
    return (
        <div className="article-list-wraper">
            <div className="article-list-menus" onClick={e => e.stopPropagation()}>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} />
                <span className="spilter"></span>
                <Button type="link" size="large" icon={<OrderedListOutlined />} onClick={() => {
                    let next = !showIdx;
                    setShowIdx(next)
                    saveShowIndex(next)
                }} />
                <Button type="link" size="large" icon={<PicRightOutlined />} onClick={() => {
                    let next = ((columnCount) % maxColumn) + 1
                    setColumnCount(next)
                    saveColumnCount(next)
                }} />
                <Button type="link" size="large" icon={<BorderBottomOutlined />} onClick={() => {
                    let next = ((borderStyle) % maxBorderStyle) + 1
                    setBorderStyle(next)
                    saveBorderStyle(next)
                }} />
                {
                    <Button type="link" size="large" icon={<PictureOutlined />} onClick={() => locator.locate(IViewService).captureElement(ref.current!)} />
                }
                <Button type="link" size="large" icon={<PrinterOutlined />} onClick={() => window.print()} />
            </div>
            <div ref={ref} className={classNames(`column-count-${columnCount}`, showIdx ? 'show-idx' : '', `border-style-${borderStyle}`, "article-list")}>{items.filter(([article]) => article.content && article.content.sections).map(
                ([article, type]) =>
                    article.lazyLoading ? <div key={article.name + '_ept'}></div> :
                        <type.Viewer title={article.name} key={article.name} showTitle={!type.noTitle} print={true} className="article" content={article.content!} files={article.files} type={type}></type.Viewer>
            )}
            </div>
        </div>
    )
}