import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import H5AppLiveViewer from './view/H5AppLiveViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import PluginInfoBase from '../../pluginbase/base'

export default class H5App extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'H5App' }
  constructor (typeNames: string[]) {
    super(H5App.typeName,
      typeNames,
      CreateSectionViewer(getSectionType),
      CreateSectionEditor({ getSectionFileContent }),
      H5AppLiveViewer,
      {
        defaultSections: `?${SectionNames.yml} ?${SectionNames.json} ?${SectionNames.text} ?${SectionNames.yml} -${SectionNames.type}`,
        fixedSections: true
      })
  }
}
