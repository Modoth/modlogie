import { ArticleSection, ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { ArticleType, NavigationSection } from '../../IPluginInfo'
import { MouseEventHandler } from 'react'

export interface AdditionalSectionViewerProps {
    articleId: string
    type: ArticleType,
    sections: ArticleSection[],
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    summaryMode?: boolean
}

export default interface SectionViewerProps {
    navigationRoot?: NavigationSection
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    pureViewMode: boolean
    className?: string;
}
