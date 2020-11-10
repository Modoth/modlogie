import './H5AppLiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { ArticlePreview } from '../../../view/pages/ArticlePreview'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import { getSectionType, SectionNames } from './Sections'
import React from 'react'

export class H5AppViewerProps {
    type: string
    data: object
}

export interface ArticleSectionVm extends ArticleSection {
    additionalSection?: boolean;
    firstSection?: boolean;
}

export default function H5AppLiveViewer (props: AdditionalSectionViewerProps) {
  const msections = new Map(props.sections.map(s => [s.name!, s]))
  const path = msections.get(SectionNames.type)?.content

  if (!path) {
    return <></>
  }
  const section = [SectionNames.yml, SectionNames.json, SectionNames.text].map(t => msections.get(t))
    .find(s => s && s.content)
  if (!section) {
    return <></>
  }
  const data = section.content
  const sectionName = section.name!
  const dataSections: ArticleSection[] = data ? [{
    name: 'data',
    content: data,
    type: getSectionType(sectionName)
  }] : []
  return <ArticlePreview path={path} dataSections={dataSections} className="h5app-live-viewer"></ArticlePreview>
}
