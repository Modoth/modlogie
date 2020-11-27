import './ExternalFileViewer.less'
import { useServicesLocate } from '../common/Contexts'
import ExternalViewer from './ExternalViewer'
import IEditorsService, { EditorInfo } from '../../app/Interfaces/IEditorsService'
import IFile from '../../infrac/Lang/IFile'
import React, { useEffect, useState } from 'react'

export interface ExternalFileViewerProps{
    file:IFile
    type?:string
}

export default function ExternalFileViewer (props:ExternalFileViewerProps) {
  const locate = useServicesLocate()
  const [info, setInfo] = useState<EditorInfo|undefined>()
  const fetchType = async () => {
    const editorsService = locate(IEditorsService)
    const info = editorsService.getViewerByFileName(await props.file.name())
    if (info) {
      setInfo(info)
    }
  }
  useEffect(() => {
    if (!info) {
      fetchType()
    }
  }, [])
  if (!info) {
    return <></>
  }
  return <div className="external-viewer"><ExternalViewer {...props} info={info}/></div>
}
