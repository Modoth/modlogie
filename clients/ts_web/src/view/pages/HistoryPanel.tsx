import './HistoryPanel.less'
import { Button } from 'antd'
import { ClearOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import IHistoryService, { HistoryItem } from '../../domain/ServiceInterfaces/IHistoryService'
import React, { useEffect, useState } from 'react'

export default function HistoryPanel(props: { onClose(): void }) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const locate = useServicesLocate()
  const historyService = locate(IHistoryService)
  const clearAll = async () => {
    await historyService.clear()
    setItems([])
  }
  useEffect(() => {
    const fetchItems = async () => {
      const items = await historyService.all()
      setItems(items)
    }
    fetchItems()
  }, [])
  return items.length ?
    <div className="history-panel">
      <Button danger className="clear-btn" icon={<ClearOutlined />} type="link" onClick={() => clearAll()}></Button>
      {items.map(i =>
        <div className="item" key={i.url} onClick={() => {
          window.location.href = `#/article${i.url}`
          props.onClose()
        }}><span className="a">{i.title}</span></div>
      )}
    </div>
    : <div></div>
}
