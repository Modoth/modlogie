import './IFrameWraper.less'
import React from 'react'

export default function IFrameWraper (props:React.IframeHTMLAttributes<HTMLIFrameElement> & {blurBg?:boolean}) {
  const blurBg = props.blurBg
  const p = Object.assign({}, props, { blurBg: undefined })
  return <div className="iframe-wraper">
    {blurBg ? <iframe className="iframe-bg hidden-fullscreen" sandbox="allow-scripts"></iframe> : undefined}
    <iframe className={blurBg ? 'with-bg' : '' } {...p} sandbox="allow-scripts"></iframe>
  </div>
}
