import IPluginInfo from '../../pluginbase/IPluginInfo'
import MathSectionEditor from './view/MathSectionEditor'
import MathSectionViewer from './view/MathSectionViewer'
import PluginInfoBase from '../../pluginbase/base'

export default class Math extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Math' }
  constructor (typeNames: string[]) {
    super(Math.typeName,
      typeNames,
      MathSectionViewer,
      MathSectionEditor
    )
  }
}
