import ChartEditor from './view/ChartEditor'
import ChartViewer from './view/ChartViewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'
import { SectionNames } from './view/SectionNames'
import ChartLiveViewer from './view/ChartLiveViewer'

export default class ChartPluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(ChartViewer, 'ChartViewer', ChartEditor, typeNames,
            {
                defaultSections: `-${SectionNames.data} -${SectionNames.type}`,
                loadAdditionalsSync: true
            },
            ChartLiveViewer)
    }
}