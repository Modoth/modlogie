import React, { useState, useEffect } from 'react'
import './ArticleList.less'
import { useServicesLocator } from '../../app/Contexts'
import IArticleListService from '../../domain/IArticleListService'
import { Button } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined, PicRightOutlined, BorderBottomOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import IConfigsService from '../../domain/IConfigsSercice';
import ConfigKeys from '../../app/ConfigKeys';
import html2canvas from 'html2canvas';
import ILangsService, { LangKeys } from '../../domain/ILangsService';

const maxColumn = 3;
const maxBorderStyle = 4;

export default function ArticleList() {
    const locator = useServicesLocator()
    const viewService = locator.locate(IViewService)
    const articleListService = locator.locate(IArticleListService)
    const [items, setItems] = useState<[Article, ArticleContentType][]>([])
    const fetchArticles = async () => {
        viewService.setLoading(true)
        try {
            var all = articleListService.all()
            let count = 0
            if (all.length) {
                setItems(all)
                viewService.setLoading(false)
                return
            }
            var maxCount = parseInt(await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.MAX_PRINT_COUNT))
            if (isNaN(maxCount)) {
                [count, all] = await articleListService.getArticles();
            } else {
                [count, all] = await articleListService.getArticles(0, maxCount);
            }
            setItems(all);
            await Promise.all(all.map(a => a[0]).filter(a => a.lazyLoading).map(a => a.lazyLoading!().then(() => {
                setItems([...all])
            })))
            viewService.setLoading(false)
        } catch (e) {
            viewService!.errorKey(locator.locate(ILangsService), e.message)
            viewService.setLoading(false)
        }
    }
    const smallScreen = window.matchMedia && window.matchMedia("(max-width: 780px)")
    const [columnCount, setColumnCount] = useState(smallScreen ? 1 : 2)
    const [borderStyle, setBorderStyle] = useState(2)
    const [showIdx, setShowIdx] = useState(false)
    useEffect(() => {
        fetchArticles()
    }, [])
    const shareArticle = async () => {
        if (!ref.current) {
            return
        }
        try {
            viewService.setLoading(true)
            const canvas = await html2canvas(ref.current);
            viewService.setLoading(false)
            const imgUrl = canvas.toDataURL('image/png')
            locator.locate(IViewService).previewImage(imgUrl)
        } catch (e) {
            viewService!.errorKey(locator.locate(ILangsService), LangKeys.UnknownError)
            viewService.setLoading(false)
        }
    }
    const ref = React.createRef<HTMLDivElement>()
    const close = () => {
        locator.locate(IViewService).previewArticleList(false)
    }
    return (
        <div className="article-list-wraper">
            <div className="article-list-menus" onClick={e => e.stopPropagation()}>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} />
                <span className="spilter"></span>
                <Button type="link" size="large" icon={<OrderedListOutlined />} onClick={() => setShowIdx(!showIdx)} />
                <Button type="link" size="large" icon={<PicRightOutlined />} onClick={() => setColumnCount(((columnCount) % maxColumn) + 1)} />
                <Button type="link" size="large" icon={<BorderBottomOutlined />} onClick={() => setBorderStyle(((borderStyle) % maxBorderStyle) + 1)} />
                {
                    showIdx ?
                        null
                        : <Button type="link" size="large" icon={<PictureOutlined />} onClick={shareArticle} />
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