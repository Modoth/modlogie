import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import CreateSectionEditor from '../base/view/SectionEditor'
import ResFileViewer from './view/ResFileViewer'
import { SectionNames, addSectionFileContent, removeSectionFileContent } from './view/Sections'

export default class ResFile extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(ResFile.name,
            typeNames,
            ResFileViewer,
            CreateSectionEditor({ addSectionFileContent, removeSectionFileContent }),
            undefined,
            {
                defaultSections: `${SectionNames.info}`,
                loadAdditionalsSync: true,
                fixedSections: true
            })
    }
}