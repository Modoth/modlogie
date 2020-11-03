import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import H5LiveViewer from './view/H5LiveViewer'
import CreateSectionViewer from '../base/view/SectionViewer'
import CreateSectionEditor from '../base/view/SectionEditor'
import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'

export default class H5 extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(H5.name,
            typeNames,
            CreateSectionViewer(getSectionType),
            CreateSectionEditor({ getSectionFileContent }),
            H5LiveViewer,
            {
                defaultSections: `?${SectionNames.html} ?${SectionNames.css} ?${SectionNames.js}  -${SectionNames.frameworks}  -${SectionNames.data}`,
                loadAdditionalsSync: true,
                fixedSections: true
            })
    }
}