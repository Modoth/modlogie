import { ResFileViewerProps } from './ResFileViewerProps'
import ExternalViewer from '../../../../view/pages/ExternalViewer'
import BufferFile from '../../../../infrac/Lang/BufferFile'
import React, { useState } from 'react'
import RemoteFile from '../../../../infrac/Lang/RemoteFile'

export function ResExternal (props: ResFileViewerProps) {
  const [file] = useState(props.buff ? new BufferFile(props.name, props.buff) : new RemoteFile(props.name, props.url, 10 * 1024))
  return <ExternalViewer file={file}></ExternalViewer>
}
