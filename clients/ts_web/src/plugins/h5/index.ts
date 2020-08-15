import H5Editor from './view/H5Editor'
import H5Viewer from './view/H5Viewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'
import { SectionNames } from './view/SectionNames'
import H5LiveViewer from './view/H5LiveViewer'

export default class H5PluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(H5Viewer, H5Editor, typeNames,
            {
                defaultSections: `_${SectionNames.html} _${SectionNames.css} _${SectionNames.js}`,
                loadAdditionalsSync: true
            },
            H5LiveViewer)
    }
}