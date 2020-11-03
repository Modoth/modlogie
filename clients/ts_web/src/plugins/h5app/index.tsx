import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import H5AppLiveViewer from './view/H5AppLiveViewer'
import CreateSectionViewer from '../base/view/SectionViewer'
import CreateSectionEditor from '../base/view/SectionEditor'
import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'

export default class H5App extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(H5App.name,
            typeNames,
            CreateSectionViewer(getSectionType),
            CreateSectionEditor({ getSectionFileContent }),
            H5AppLiveViewer,
            {
                defaultSections: `?${SectionNames.data} -${SectionNames.type}`,
                loadAdditionalsSync: true,
                fixedSections: true
            })
    }
}