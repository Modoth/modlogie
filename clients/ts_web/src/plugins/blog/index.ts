import MarkdownEditor from './view/MarkdownEditor'
import MarkdownViewer from './view/MarkdownViewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'

export default class BlogPluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(MarkdownViewer, 'MarkdownViewer', MarkdownEditor, typeNames)
    }
}