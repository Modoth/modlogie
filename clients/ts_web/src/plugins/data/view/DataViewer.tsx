import './DataViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import { SectionNames } from './Sections'
import HighlightLive from '../../../view/pages/HighlightLive'
import React from 'react'

const getDataSection = (sections: Map<string, ArticleSection>): {type:string, data?:ArticleSection} => {
  const type = sections.get(SectionNames.type)?.content || ''
  const data = sections.get(SectionNames.yml) ||
   sections.get(SectionNames.json) ||
  sections.get(SectionNames.xml) ||
  sections.get(SectionNames.text)
  return { type, data }
}

export default function DataViewer (props: AdditionalSectionViewerProps) {
  const section = getDataSection(new Map(props.sections.map(s => [s.name!, s])))
  return <HighlightLive language={section.type} format={section.data?.name || ''} value={section.data?.content || ''}></HighlightLive>
}
