import './ToolViewer.less'
import { Button } from 'antd'
import { FileOutlined, CloseOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import ExternalFileViewer from './ExternalFileViewer'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'
import WebFile from '../../infrac/Lang/WebFile'

export function ToolViewer () {
  const [file, setFile] = useState<IFile|undefined>()
  const [name, setName] = useState<string|undefined>()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const viewService = locator.locate(IViewService)
  const selectFile = () => {
    viewService.prompt(langs.get(LangKeys.Open), [
      {
        type: 'File',
        value: undefined
      }
    ], async (file:File) => {
      setFile(undefined)
      setFile(new WebFile(file))
      setName(file.name)
      return true
    }, false)
  }
  viewService.setFloatingMenus?.(ToolViewer.name, <>
    <Button type="primary" size="large" shape="circle" icon={<FileOutlined />} onClick={selectFile}></Button>
    {file ? <Button type="primary" size="large" shape="circle" danger icon={<CloseOutlined />} onClick={() => {
      setFile(undefined)
      setName('')
    }}></Button> : undefined}
  </>, !!file)
  useEffect(() => {
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
