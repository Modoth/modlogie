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
  const renders : any = {
    code: HighlightLive,
  }
  const contentBase = (window.ENV_OVERRIDE || ENV).CONTENT_BASE || ""
  if (contentBase) {
    renders.image = (props: { alt: string, src: string }) => {
      const url = contentBase + props.src
      return <img alt={props.alt} src={url} />
    }
  }
  if (!root) {
    return renders
  }
  root.children = []
  renders.heading = ({ level, children }: { level: number, children: [React.ReactElement] }) => {
    const s = new NavigationSection(getText(children), level)
    root.children.push(s)
    return <LocatableView callbacks={s} View={() => React.createElement(`h${level}`, null, ...children)}></LocatableView>
  }
  return renders
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
