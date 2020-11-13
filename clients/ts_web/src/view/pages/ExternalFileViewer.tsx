import './ExternalFileViewer.less'
import { useServicesLocator } from '../common/Contexts'
import ExternalViewer from './ExternalViewer'
import IEditorsService, { EditorInfo } from '../../app/Interfaces/IEditorsService'
import IFile from '../../infrac/Lang/IFile'
import React, { useEffect, useState } from 'react'

export interface ExternalFileViewerProps{
    file:IFile
    type?:string
}

export default function ExternalFileViewer (props:ExternalFileViewerProps) {
  const locator = useServicesLocator()
  const [info, setInfo] = useState<EditorInfo|undefined>()
  const fetchType = async () => {
    const editorsService = locator.locate(IEditorsService)
    const info = await editorsService.getViewerByFileName(await props.file.name())
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
