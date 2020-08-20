import { ArticleSection, ArticleFile } from "../../../domain/Article";
import { MouseEventHandler } from "react";

export interface SectionViewerCallbacks {
    focus?(): void
    onfocus?(): void
}

export interface AdditionalSectionsViewerProps {
    sections: ArticleSection[],
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
}

export default interface SectionViewerProps {
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    callbacks?: SectionViewerCallbacks
    pureViewMode: boolean
    className?: string;
}
