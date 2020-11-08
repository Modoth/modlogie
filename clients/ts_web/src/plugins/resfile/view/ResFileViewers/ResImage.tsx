import './ResImage.less'
import { ResFileViewerProps } from './ResFileViewerProps'
import React from 'react'

export function ResImage (props: ResFileViewerProps) {
  const url = props.url
  if (!url) {
    return <></>
  }
  return <div className="resimage">
    <img src={url}></img>
  </div>
}
