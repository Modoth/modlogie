import H5AppEditor from './view/H5AppEditor'
import H5AppViewer from './view/H5AppViewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'
import { SectionNames } from './view/SectionNames'
import H5AppLiveViewer from './view/H5AppLiveViewer'

export default class H5AppPluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(H5AppViewer, 'H5AppViewer', H5AppEditor, typeNames,
            {
                defaultSections: `?${SectionNames.data} -${SectionNames.type}`,
                loadAdditionalsSync: true
            },
            H5AppLiveViewer)
    }
}