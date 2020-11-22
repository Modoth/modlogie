import './ToolViewer.less'
import { Button } from 'antd'
import { FileOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import ExternalFileViewer from './ExternalFileViewer'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState } from 'react'
import WebFile from '../../infrac/Lang/WebFile'

export function ToolViewer () {
  const [file, setFile] = useState<IFile|undefined>()
  const [name, setName] = useState<string|undefined>()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const selectFile = () => {
    const viewService = locator.locate(IViewService)
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
  return <div className="tool-viewer-wraper">
    <div className="tool-viewer">
      <div className="menu">
        <Button type="link" icon={<FileOutlined />} onClick={selectFile}></Button>
        <Button type="link" className="menu-title"> <span >{name || ''}</span></Button>
        <Button type="link" icon={<CloseCircleOutlined />} onClick={() => setFile(undefined)}></Button>
      </div>
      {
        file ? <ExternalFileViewer file={file}></ExternalFileViewer> : <div onClick={selectFile} className="external-viewer"></div>
      }
    </div>
  </div>
}
