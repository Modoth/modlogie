import './ToolViewer.less'
import { Button } from 'antd'
import { FileOutlined, CloseOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import BufferFile from '../../infrac/Lang/BufferFile'
import ExternalFileViewer from './ExternalFileViewer'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IRecentFileService from '../../domain/ServiceInterfaces/IRecentFileService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'
import WebFile from '../../infrac/Lang/WebFile'

const RecentFileKey = 'ToolViewer'

export function ToolViewer () {
  const [file, setFile] = useState<IFile|undefined>()
  const [name, setName] = useState<string|undefined>()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const fileService = locator.locate(IRecentFileService)
  const selectFile = () => {
    viewService.prompt(langs.get(LangKeys.Open), [
      {
        type: 'File',
        value: undefined
      }
    ], async (file:File) => {
      loadFile(file)
      return true
    }, false)
  }

  const loadFile = async (file?:File) => {
    setFile(undefined)
    setName('')
    await fileService.set(RecentFileKey)
    if (!file) {
      return
    }
    setName(file.name)
    if (file.size > await fileService.limit()) {
      setFile(new WebFile(file))
    } else {
      const buff = await file.arrayBuffer()
      fileService.set(RecentFileKey, {
        name: file.name,
        type: file.type,
        size: file.size,
        buff
      })
      setFile(new BufferFile(file.name, buff))
    }
  }
  useEffect(() => {
  viewService.setFloatingMenus?.(ToolViewer.name, <>
    <Button type="primary" size="large" shape="circle" icon={<FileOutlined />} onClick={selectFile}></Button>
    {file ? <Button type="primary" size="large" shape="circle" danger icon={<CloseOutlined />} onClick={() => {
      loadFile()
    }}></Button> : undefined}
  </>, !!file)
  })
  useEffect(() => {
    const loadLastFile = async () => {
      const file = await fileService.get(RecentFileKey)
      if (file) {
        setFile(new BufferFile(file.name, file.buff))
        setName(file.name)
      }
    }
    loadLastFile()
    return () => {
      viewService.setFloatingMenus?.(ToolViewer.name)
    }
  }, [])
  return <div className="tool-viewer-wraper">
    <div className="tool-viewer">
      <div className="menu">
        <Button type="link" className="menu-title"> <span >{name || ''}</span></Button>
      </div>
      {
        file ? <ExternalFileViewer file={file}></ExternalFileViewer> : <div onClick={selectFile} className="external-viewer"></div>
      }
    </div>
  </div>
}
