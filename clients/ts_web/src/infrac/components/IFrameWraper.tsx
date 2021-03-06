import './IFrameWraper.less'
import React from 'react'

const stopEvent = (e: React.MouseEvent<HTMLIFrameElement, MouseEvent>) => e.stopPropagation()
export default function IFrameWraper (props:React.IframeHTMLAttributes<HTMLIFrameElement> & {blurBg?:boolean}) {
  const blurBg = props.blurBg
  const p = Object.assign({}, props)
  delete p.blurBg
  return <div className="iframe-wraper">
    {blurBg ? <iframe onClick={stopEvent} className="iframe-bg hidden-fullscreen" {...p} ></iframe> : undefined}
    <iframe onClick={stopEvent} className={blurBg ? 'with-bg' : '' } {...p} ></iframe>
  </div>
}
