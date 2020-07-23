import React, { useState, useEffect } from 'react'
import './ArticleListSummary.less'
import { useServicesLocator } from '../../app/Contexts'
import IArticleListService from '../../domain/IArticleListService'
import { Badge, Button } from 'antd';
import { PrinterOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType } from '../../plugins/IPluginInfo';
import IViewService from '../services/IViewService';

export default function ArticleListSummary() {
    const locator = useServicesLocator()
    const articleListService = locator.locate(IArticleListService)
    const [items, setItems] = useState<[Article, ArticleContentType][]>([])
    const onArticleListChange = async () => {
        const all = articleListService.all()
        setItems(all)
    }
    articleListService.addChangeListener(onArticleListChange)
    useEffect(() => {
        return function cleanup() {
            articleListService.removeChangeListener(onArticleListChange)
        };
    });
    useEffect(() => {
        onArticleListChange()
    }, [])

    const open = () => {
        locator.locate(IViewService).previewArticleList(true)
    }

    return items.length > 0 ? (
        <Badge count={items.length} className="article-list-summary">
            <Button onClick={open} type="primary" className="summary-button" size="large" shape="circle" icon={<PrinterOutlined className="head-example" />} />
        </Badge>
    ) : <></>
}