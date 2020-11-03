import IPluginInfo from '../IPluginInfo'
import PluginInfoBase from '../base'
import MathSectionViewer from './view/MathSectionViewer'
import MathSectionEditor from './view/MathSectionEditor'

export default class Math extends PluginInfoBase implements IPluginInfo {
    static get typeName() { return "Math" }
    constructor(typeNames: string[]) {
        super(Math.typeName,
            typeNames,
            MathSectionViewer,
            MathSectionEditor
        )
    }
}