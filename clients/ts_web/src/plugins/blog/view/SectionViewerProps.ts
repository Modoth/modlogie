import { ArticleSection, ArticleFile } from "../../../domain/Article";
import { MouseEventHandler } from "react";

export default interface SectionViewerProps {
    section: ArticleSection,
    filesDict: Map<string, ArticleFile>
    onClick?: MouseEventHandler<any>
    pureViewMode: boolean
}