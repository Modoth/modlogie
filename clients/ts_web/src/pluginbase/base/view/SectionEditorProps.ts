import { ArticleContentEditorCallbacks } from '../../IPluginInfo'
import { ArticleSection, ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { MouseEventHandler } from 'react'
import IFormulaEditingService from '../IFormulaEditingService'
import SectionViewerProps from './SectionViewerProps'

export default interface SectionEditorProps {
    section: ArticleSection,
    callbacks: ArticleContentEditorCallbacks<string>,
    filesDict: Map<string, ArticleFile>,
    editing?: boolean
    onpaste: (file: File) => void
    onClick?: MouseEventHandler<any>
    formulaEditor?: IFormulaEditingService,
    viewer: { (props: SectionViewerProps): JSX.Element }
}
