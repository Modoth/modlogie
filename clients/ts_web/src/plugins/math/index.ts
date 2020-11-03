import IPluginInfo from '../IPluginInfo'
import PluginInfoBase from '../base'
import MathSectionViewer from './view/MathSectionViewer'
import MathSectionEditor from './view/MathSectionEditor'

export default class Math extends PluginInfoBase implements IPluginInfo {
    constructor(typeNames: string[]) {
        super(Math.name,
            typeNames,
            MathSectionViewer,
            MathSectionEditor
        )
    }
}