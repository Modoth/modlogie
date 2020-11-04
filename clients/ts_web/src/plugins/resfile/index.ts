import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import CreateSectionEditor from '../base/view/SectionEditor'
import ResFileViewer from './view/ResFileViewer'
import { SectionNames, addSectionFileContent, removeSectionFileContent } from './view/Sections'
import CreateSectionViewer from '../base/view/SectionViewer'

export default class ResFile extends PluginInfoBase implements IPluginInfo {
    static get typeName() { return "ResFile" }
    constructor(typeNames: string[]) {
        super(ResFile.typeName,
            typeNames,
            ResFileViewer,
            CreateSectionEditor({ addSectionFileContent, removeSectionFileContent, viewer: CreateSectionViewer((_) => 'yml') }),
            undefined,
            {
                defaultSections: `${SectionNames.info}`,
                fixedSections: true
            })
    }
}