import { ArticleSection, ArticleFile } from "../../../domain/Article";
import { MouseEventHandler } from "react";

export interface SectionViewerCallbacks {
    focus?(): void
    onfocus?(): void
}

export default interface SectionViewerProps {
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    callbacks?: SectionViewerCallbacks
    pureViewMode: boolean
}