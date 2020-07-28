import React, { useState, useEffect } from 'react'
import './ArticleList.less'
import { useServicesLocator } from '../../app/Contexts'
import IArticleListService from '../../domain/IArticleListService'
import { Button } from 'antd';
import { CloseOutlined, PrinterOutlined, ReadOutlined, BorderOuterOutlined, PictureOutlined, OrderedListOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import IConfigsService from '../../domain/IConfigsSercice';
import ConfigKeys from '../../app/ConfigKeys';
import html2canvas from 'html2canvas';

const maxColumn = 3;
const maxBorderStyle = 4;

export default function ArticleList() {
    const locator = useServicesLocator()
    const articleListService = locator.locate(IArticleListService)
    const [items, setItems] = useState<[Article, ArticleContentType][]>([])
    const fetchArticles = async () => {
        var all = articleListService.all()
        let count = 0
        if (!all.length) {
            var maxCount = parseInt(await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.MAX_PRINT_COUNT))
            if (isNaN(maxCount)) {
                [count, all] = await articleListService.getArticles();
            } else {
                [count, all] = await articleListService.getArticles(0, maxCount);
            }
        }
        setItems(all)
    }
    const [columnCount, setColumnCount] = useState(2)
    const [borderStyle, setBorderStyle] = useState(2)
    const [showIdx, setShowIdx] = useState(false)
    useEffect(() => {
        fetchArticles()
    }, [])
    const shareArticle = async () => {
        if (!ref.current) {
            return
        }
        const canvas = await html2canvas(ref.current);
        const imgUrl = canvas.toDataURL('image/png')
        locator.locate(IViewService).previewImage(imgUrl)
    }
    const ref = React.createRef<HTMLDivElement>()
    const close = () => {
        locator.locate(IViewService).previewArticleList(false)
    }
    return (
        <>
            <div ref={ref} className={classNames(`column-count-${columnCount}`, showIdx ? 'show-idx' : '', `border-style-${borderStyle}`, "article-list")}>{items.filter(([article]) => article.content && article.content.sections).map(
                ([article, type]) =>
                    <>
                        <type.Viewer title={article.name} showTitle={!type.noTitle} print={true} className="article" content={article.content!} files={article.files} type={type}></type.Viewer>
                    </>
            )}
            </div>
            <div className="article-list-menus" onClick={e => e.stopPropagation()}>
                <Button type="primary" size="large" shape="circle" icon={<OrderedListOutlined />} onClick={() => setShowIdx(!showIdx)} />
                <Button type="primary" size="large" shape="circle" icon={<ReadOutlined />} onClick={() => setColumnCount(((columnCount) % maxColumn) + 1)} />
                <Button type="primary" size="large" shape="circle" icon={<BorderOuterOutlined />} onClick={() => setBorderStyle(((borderStyle) % maxBorderStyle) + 1)} />
                {
                    showIdx ?
                        null
                        : <Button type="primary" size="large" shape="circle" icon={<PictureOutlined />} onClick={shareArticle} />
                }
                <Button type="primary" size="large" shape="circle" icon={<PrinterOutlined />} onClick={() => window.print()} />
                <Button type="primary" size="large" danger shape="circle" icon={<CloseOutlined />} onClick={close} />
            </div>
        </>
    )
}