import './SectionViewer.less'
import classNames from 'classnames'
import EnhancedMarkdown from '../../../view/pages/EnhancedMarkdown'
import React from 'react'
import SectionViewerProps from './SectionViewerProps'

export default function CreateSectionViewer (getSectionType: { (name: string): string }) {
  return function SectionViewer (props: SectionViewerProps) {
    return <div onClick={props.onClick} className={classNames('section-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
      <label className="section-name">{props.section.name}</label>
      <EnhancedMarkdown source={'```' + `${getSectionType(props.section.name!)}\n` + props.section?.content + '\n```'} linkTarget="_blank" />
    </div>
  }
}
