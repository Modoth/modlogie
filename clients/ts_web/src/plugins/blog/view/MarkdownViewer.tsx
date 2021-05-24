import './MarkdownViewer.less'
import { getText } from './Renders/common'
import { NavigationSection } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import EnhancedMarkdown from '../../../view/pages/EnhancedMarkdown'
import Cloze from './Renders/Cloze'
import getImage from './Renders/Image'
import LocatableView from '../../../infrac/components/LocatableView'
import React from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'
import Trans from './Renders/Trans'

const getRenders = (root: NavigationSection | undefined) => {
  const renders: any = {}
  renders.image = getImage((window.ENV_OVERRIDE || window.ENV || {}).CONTENT_BASE || '')
  renders.strong = Cloze
  renders.emphasis = Trans
  // eslint-disable-next-line react/display-name
  renders.paragraph = (props: any) => {
    if (props.children?.[0]?.type === renders.image) {
      return <p className="md-img-p">{props.children}</p>
    }
    return <p>{props.children}</p>
  }
  if (!root) {
    return renders
  }
  root.children = []

  // eslint-disable-next-line react/display-name
  renders.heading = ({ level, children }: { level: number, children: [React.ReactElement] }) => {
    const s = new NavigationSection(getText(children), level)
    root.children.push(s)
    return <LocatableView callbacks={s} View={() => React.createElement(`h${level + 1}`, null, ...children)}></LocatableView>
  }
  return renders
}

export default function MarkdownViewer (props: SectionViewerProps) {
  const renderers = getRenders(props.navigationRoot) as any
  return <div className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}
    onClick={(e) => {
      if (props.onClick) {
        e.preventDefault()
        props.onClick(e)
      }
    }}>
    <label className="md-name">{props.section.name}</label>
    <EnhancedMarkdown renderers={renderers} source={props.section?.content} linkTarget="_blank" />
  </div>
}
