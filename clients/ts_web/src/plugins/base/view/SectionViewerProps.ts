import { ArticleSection, ArticleFile } from "../../../domain/ServiceInterfaces/Article";
import { MouseEventHandler } from "react";

export interface AdditionalSectionViewerProps {
    sections: ArticleSection[],
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
}

export default interface SectionViewerProps {
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    pureViewMode: boolean
    className?: string;
}
