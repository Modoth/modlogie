import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import CreateSectionEditor from '../base/view/SectionEditor'
import { getSectionFileContent, getPasteSectionContent } from './view/Sections'
import MarkdownViewer from './view/MarkdownViewer'

export default class Blog extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(Blog.name,
            typeNames,
            MarkdownViewer,
            CreateSectionEditor({ getSectionFileContent, getPasteSectionContent }))
    }
}