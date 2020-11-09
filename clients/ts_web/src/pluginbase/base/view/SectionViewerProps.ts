import { ArticleSection, ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { ArticleType } from '../../IPluginInfo'
import { MouseEventHandler } from 'react'

export interface AdditionalSectionViewerProps {
    type:ArticleType,
    sections: ArticleSection[],
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    summaryMode?:boolean
}

export default interface SectionViewerProps {
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    pureViewMode: boolean
    className?: string;
}
