import { ArticleSection, ArticleFile } from "../../../domain/Article";
import { ArticleContentEditorCallbacks } from "../../IPluginInfo";
import { MouseEventHandler } from "react";
import IFormulaEditingService from "../IFormulaEditingService";

export default interface SectionEditorProps {
    section: ArticleSection,
    callbacks: ArticleContentEditorCallbacks<string>,
    filesDict: Map<string, ArticleFile>,
    editing?: boolean
    onpaste: (file: File) => void
    onClick?: MouseEventHandler<any>
    formulaEditor?: IFormulaEditingService
}