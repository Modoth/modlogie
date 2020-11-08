import PluginInfoBase from '../../pluginbase/base'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import H5LiveViewer from './view/H5LiveViewer'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'

export default class H5 extends PluginInfoBase implements IPluginInfo {
    static get typeName() { return "H5" }
    constructor(typeNames: string[]) {
        super(H5.typeName,
            typeNames,
            CreateSectionViewer(getSectionType),
            CreateSectionEditor({ getSectionFileContent }),
            H5LiveViewer,
            {
                defaultSections: `?${SectionNames.js} ?${SectionNames.html} ?${SectionNames.css} -${SectionNames.frameworks}  -${SectionNames.data}`,
                fixedSections: true
            })
    }
}