import FullscreenWraper from './FullscreenWraper'
import React from 'react'

function IFrame (props: { src: string }) {
  return <iframe src={props.src} sandbox=""></iframe>
}

export default function IFrameWithoutJs (props: { src: string, allowFullscreen?:boolean }) {
  return <FullscreenWraper enabled={props.allowFullscreen} View={IFrame} src={props.src} ></FullscreenWraper>
}
