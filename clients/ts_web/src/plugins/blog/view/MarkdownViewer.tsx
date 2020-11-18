import './MarkdownViewer.less'
import classNames from 'classnames'
import HighlightLive from '../../../view/pages/HighlightLive'
import Markdown from '../../../infrac/components/Markdown'
import React from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'

const getRenders = () => {
  return ({
    code: HighlightLive
  })
}

export default function MarkdownViewer (props: SectionViewerProps) {
  const renderers = getRenders() as any
  return <div onClick={(e) => {
    if ((e.target as any)?.nodeName === 'A') {
      return
    }
    if (props.onClick) {
      props.onClick(e)
    }
  }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}>
    <label className="md-name">{props.section.name}</label>
    <Markdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></Markdown>
  </div>
}
