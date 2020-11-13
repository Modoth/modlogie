import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'
import ChartLiveViewer from './view/ChartLiveViewer'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import PluginInfoBase from '../../pluginbase/base'

export default class Chart extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Chart' }
  constructor (typeNames: string[]) {
    super(Chart.typeName,
      typeNames,
      CreateSectionViewer(getSectionType),
      CreateSectionEditor({ getSectionFileContent }),
      ChartLiveViewer,
      {
        defaultSections: [`-${SectionNames.data}`, `-${SectionNames.type}`],
        fixedSections: true
      })
  }
}
