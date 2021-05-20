import './ArticleListSummary.less'
import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import { Badge, Button } from 'antd'
import { ExportOutlined, ClearOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import IArticleListService from '../../app/Interfaces/IArticleListService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export default function ArticleListSummary () {
  const locate = useServicesLocate()
  const articleListService = locate(IArticleListService)
  const [items, setItems] = useState<[Article, ArticleContentType][]>([])
  const onArticleListChange = async () => {
    const all = articleListService.all()
    setItems(all)
  }
  articleListService.addChangeListener(onArticleListChange)
  useEffect(() => {
    return function cleanup () {
      articleListService.removeChangeListener(onArticleListChange)
    }
  })
  useEffect(() => {
    onArticleListChange()
  }, [])

  const open = () => {
    locate(IViewService).previewArticleList(true)
  }

  return items.length > 0 ? (
    <>
      <Badge count={items.length} className="article-list-summary">
        <Button onClick={open} type="primary" className="summary-button" size="large" shape="circle" icon={<ExportOutlined className="head-example" />} />
      </Badge>
    </>
  ) : <>
    <Button onClick={open} type="primary" className="summary-button" size="large" shape="circle" icon={<ExportOutlined className="head-example" />} />
  </>
}
