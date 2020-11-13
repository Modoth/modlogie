import { ResFileViewerProps } from './ResFileViewerProps'
import BufferFile from '../../../../infrac/Lang/BufferFile'
import ExternalFileViewer from '../../../../view/pages/ExternalFileViewer'
import React, { useState } from 'react'
import RemoteFile from '../../../../infrac/Lang/RemoteFile'

export function ResExternal (props: ResFileViewerProps) {
  const [file] = useState(props.buff ? new BufferFile(props.name, props.buff) : new RemoteFile(props.name, props.url, 10 * 1024))
  return <ExternalFileViewer file={file}></ExternalFileViewer>
}
