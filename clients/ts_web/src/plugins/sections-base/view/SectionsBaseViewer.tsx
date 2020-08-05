import React, { useState } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo'
import { ArticleSection } from '../../../domain/Article'
import './SectionsBaseViewer.less'
import classNames from 'classnames'
import SectionViewerProps from './SectionViewerProps'

const getSections = (allSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  return Array.from(allSections, (name) => existedSections.get(name) || { name, content: '' } as ArticleSection)
}

export default function SectionsBaseViewer(TSectionViewer: { (props: SectionViewerProps): JSX.Element }) {
  return (props: ArticleContentViewerProps) => {
    const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
    const [sections] = useState((getSections(props.type?.allSections!, props.content!.sections!)))
    const [showHidden, setShowHidden] = useState(props.showHiddens == true)
    return (
      <div className={classNames(props.className, props.type?.name, TSectionViewer.name, "sections-base-viewer")} onClick={(e) => {
        if (props.onClick) {
          props.onClick(e)
        } else {
          setShowHidden(!showHidden)
        }
      }
      }>
        {sections.filter(s => s.content && s.content.match(/\S/)).filter(s => showHidden || !props.type?.hidenSections.has(s.name!)).map((section) => (
          <TSectionViewer key={section.name} section={section} filesDict={filesDict} pureViewMode={true} />
        ))}
      </div>
    )
  }
}
