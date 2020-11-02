import ResFileEditor from './view/ResFileEditor'
import ResFileViewer from './view/ResFileViewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'
import { SectionNames } from './view/SectionNames'

export default class ResFilePluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(ResFileViewer, 'ResFileViewer', ResFileEditor, typeNames,
            {
                defaultSections: `${SectionNames.info}`,
                loadAdditionalsSync: true
            })
    }
}