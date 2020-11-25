import FullscreenWraper from './FullscreenWraper'
import IFrameWraper from './IFrameWraper'
import React from 'react'

export default function IFrameWithoutJs (props: { src?: string, srcDoc?:string, allowFullscreen?:boolean, withMask?:boolean}) {
  return <FullscreenWraper enabled={props.allowFullscreen} src={props.src} srcDoc={props.srcDoc} sandbox="" blurBg={props.withMask} View={IFrameWraper} ></FullscreenWraper>
}
