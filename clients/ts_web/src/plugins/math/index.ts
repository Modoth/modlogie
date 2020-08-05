import SectionEditor from './view/SectionEditor'
import SectionViewer from './view/SectionViewer'
import SectionCommonPluginInfo from '../sections-base'
import IPluginInfo from '../IPluginInfo'

export default class MathPluginInfo extends SectionCommonPluginInfo implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(SectionViewer, SectionEditor, typeNames)
    }
}