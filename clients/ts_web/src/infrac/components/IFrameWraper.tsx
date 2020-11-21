import './IFrameWraper.less'
import React from 'react'

export default function IFrameWraper (props:React.IframeHTMLAttributes<HTMLIFrameElement> & {withMask?:boolean}) {
  const withMask = props.withMask
  const p = Object.assign({}, props, { withMask: undefined })
  return <div className="iframe-wraper">
    <iframe {...p} sandbox="allow-scripts"></iframe>
    {withMask ? <div className="foreground-iframe-wraper"><iframe {...p} className="foreground-iframe" sandbox="allow-scripts"></iframe></div> : undefined}
  </div>
}
