import { SectionNames, addSectionFileContent, removeSectionFileContent } from './view/Sections'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import PluginInfoBase from '../../pluginbase/base'
import ResFileViewer from './view/ResFileViewer'

export default class ResFile extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'ResFile' }
  constructor (typeNames: string[]) {
    super(ResFile.typeName,
      typeNames,
      ResFileViewer,
      CreateSectionEditor({ addSectionFileContent, removeSectionFileContent, viewer: CreateSectionViewer((_) => 'yml') }),
      undefined,
      {
        defaultSections: `${SectionNames.info}`,
        fixedSections: true
      })
  }
}
