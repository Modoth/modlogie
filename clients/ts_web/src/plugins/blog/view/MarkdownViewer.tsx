import './MarkdownViewer.less'
import classNames from 'classnames'
import HighlightLive from '../../../view/pages/HighlightLive'
import Markdown from '../../../infrac/components/Markdown'
import React from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'
import { NavigationSection } from '../../../pluginbase/IPluginInfo'
import LocatableView from '../../../infrac/components/LocatableView'

const getText = (children: [React.ReactElement] | string): string => {
  if (children == null) {
    return ""
  }
  if (typeof (children) === "string") {
    return children
  }
  if (!children.length) {
    return ""
  }
  return (children as [React.ReactElement]).map(c => c.props?.children ? getText(c.props?.children) : "").join("")
}

const getRenders = (root: NavigationSection | undefined) => {
  if (!root) {
    return { code: HighlightLive }
  }
  root.children = []
  return ({
    code: HighlightLive,
    // eslint-disable-next-line react/display-name
    heading: ({ level, children }: { level: number, children: [React.ReactElement] }) => {
      const s = new NavigationSection(getText(children), level)
      root.children.push(s)
      return <LocatableView callbacks={s} View={() => React.createElement(`h${level}`, null, ...children)}></LocatableView>
    }
  })
}

export default function MarkdownViewer(props: SectionViewerProps) {
  const renderers = getRenders(props.navigationRoot) as any
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
