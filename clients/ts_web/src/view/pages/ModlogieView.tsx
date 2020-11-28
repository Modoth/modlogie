import './ModlogieView.less'
import AudioPlayer from './AudioPlayer'
import ClocksPanel from './ClocksPanel'
import React from 'react'

export default function ModlogieView () {
  return <div className="moglogie-view">
    <ClocksPanel></ClocksPanel>
    <AudioPlayer></AudioPlayer>
  </div>
}
