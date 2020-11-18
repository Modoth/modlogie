import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import DataViewer from './view/DataViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import PluginInfoBase from '../../pluginbase/base'

export default class Data extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Data' }
  constructor (typeNames: string[]) {
    super(Data.typeName,
      typeNames,
      CreateSectionViewer(getSectionType),
      CreateSectionEditor({ getSectionFileContent }),
      DataViewer,
      {
        defaultSections: [`-${SectionNames.type}`, `?${SectionNames.yml}`, `?${SectionNames.xml}`, `?${SectionNames.json}`, `?${SectionNames.text}`],
        fixedSections: true
      })
  }
}
