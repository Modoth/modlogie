import PluginInfoBase from '../base'
import IPluginInfo from '../IPluginInfo'
import ChartLiveViewer from './view/ChartLiveViewer'
import CreateSectionViewer from '../base/view/SectionViewer'
import CreateSectionEditor from '../base/view/SectionEditor'
import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'

export default class Chart extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(Chart.name,
            typeNames,
            CreateSectionViewer(getSectionType),
            CreateSectionEditor({ getSectionFileContent }),
            ChartLiveViewer,
            {
                defaultSections: `-${SectionNames.data} -${SectionNames.type}`,
                loadAdditionalsSync: true,
                fixedSections: true
            })
    }
}