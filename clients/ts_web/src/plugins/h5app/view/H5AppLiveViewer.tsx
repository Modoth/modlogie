import React from 'react'
import { AdditionalSectionViewerProps } from '../../base/view/SectionViewerProps';
import { ArticleSection } from '../../../domain/Article';
import { SectionNames } from './Sections';
import './H5AppLiveViewer.less'
import { ArticlePreview } from '../../../view/pages/ArticlePreview';


export class H5AppViewerProps {
    type: string
    data: object
}

export interface ArticleSectionVm extends ArticleSection {
    additionalSection?: boolean;
    firstSection?: boolean;
}

const getSections = (allSections: Set<string>, additionalSections: Set<string>, sections?: ArticleSection[]) => {
    const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
    var s = Array.from(allSections, (name) => Object.assign(existedSections.get(name) || { name, content: '' }, { additionalSection: additionalSections && additionalSections.has(name) }) as ArticleSectionVm)
    if (s[0]) {
        s[0].firstSection = true;
    }
    return s;
}

export default function H5AppLiveViewer(props: AdditionalSectionViewerProps) {
    var msections = new Map(props.sections.map(s => [s.name!, s]))
    var path = msections.get(SectionNames.type)?.content
    var data = msections.get(SectionNames.data)?.content

    if (!path) {
        return <></>
    }
    var dataSections: ArticleSection[] = data ? [{
        name: 'yaml',
        content: data
    }] : []
    return <ArticlePreview path={path} dataSections={dataSections} className="h5app-live-viewer"></ArticlePreview>
}