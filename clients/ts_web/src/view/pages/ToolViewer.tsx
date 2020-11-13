import './ToolViewer.less'
import { Button } from 'antd'
import { FileOutlined, CloseOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import BufferFile from '../../infrac/Lang/BufferFile'
import ExternalFileViewer from './ExternalFileViewer'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { memo, useState } from 'react'

const ExternalFileViewerMemo = memo(ExternalFileViewer)

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
      setFile(new BufferFile(file.name, await file.arrayBuffer()))
      setName(file.name)
      return true
    }, false)
  }
  return <div className="tool-viewer">
    <div className="menu">
      <Button type="text" icon={<FileOutlined />} onClick={selectFile}></Button>
      <span className="menu-title">{name || ''}</span>
      <Button type="text" icon={<CloseOutlined />} onClick={() => setFile(undefined)}></Button>
    </div>
    {
      file ? <ExternalFileViewer file={file}></ExternalFileViewer> : <div onClick={selectFile} className="external-viewer"></div>
    }
    <div className="status"></div>
  </div>
}
