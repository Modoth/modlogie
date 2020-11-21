import FullscreenWraper from './FullscreenWraper'
import IFrameWraper from './IFrameWraper'
import React from 'react'

export default function IFrameWithoutJs (props: { src: string, allowFullscreen?:boolean, withMask?:boolean}) {
  return <FullscreenWraper enabled={props.allowFullscreen} src={props.src} sandbox="" withMask={props.withMask} View={IFrameWraper} ></FullscreenWraper>
}
