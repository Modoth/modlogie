import SectionEditor from './view/SectionEditor'
import SectionViewer from './view/SectionViewer'
import SectionsBasePluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'

export default class MathPluginInfo extends SectionsBasePluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(SectionViewer, SectionEditor, typeNames)
    }
}