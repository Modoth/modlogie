import React, { useState } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo'
import { ArticleSection } from '../../../domain/Article'
import './BlogViewer.less'
import SectionViewer from './SectionViewer'
import classNames from 'classnames'

const getSections = (allSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  return Array.from(allSections, (name) => existedSections.get(name) || { name, content: '' } as ArticleSection)
}

export default function BlogViewer(props: ArticleContentViewerProps) {
  const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
  const [sections] = useState((getSections(props.type?.allSections!, props.content!.sections!)))
  const [showHidden, setShowHidden] = useState(props.showHiddens == true)
  return (
    <div className={classNames(props.className, props.type?.name, "blog-viewer")} onClick={(e) => {
      if (props.onClick) {
        props.onClick(e)
      } else {
        setShowHidden(!showHidden)
      }
    }
    }>
      {sections.filter(s => s.content && s.content.match(/\S/)).filter(s => showHidden || !props.type?.hidenSections.has(s.name!)).map((section) => (
        <SectionViewer key={section.name} section={section} filesDict={filesDict} pureViewMode={true} />
      ))}
    </div>
  )
}
