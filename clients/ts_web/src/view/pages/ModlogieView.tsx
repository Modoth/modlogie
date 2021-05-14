import './ModlogieView.less'
import AudioPlayer from './AudioPlayer'
import ClocksPanel from './ClocksPanel'
import HistoryPanel from './HistoryPanel'
import React from 'react'
import MagicMaskSetting from './MagicMaskSetting'

export default function ModlogieView (props:{onClose():void}) {
  return <div className="moglogie-view">
    <HistoryPanel onClose={props.onClose}></HistoryPanel>
    <ClocksPanel></ClocksPanel>
    <AudioPlayer></AudioPlayer>
    <MagicMaskSetting onClose={props.onClose}/>
  </div>
}
