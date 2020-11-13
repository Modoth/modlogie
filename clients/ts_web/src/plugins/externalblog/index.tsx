import { getSectionFileContent, getSectionType, SectionNames } from './view/Sections'
import { TypeDefaultConfigs } from './view/Configs'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import ExternalBlogViewer from './view/ExternalBlogViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import Langs from './view/Langs'
import PluginInfoBase from '../../pluginbase/base'

export default class ExternalBlog extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'ExtBlog' }
  constructor (typeNames: string[]) {
    super(ExternalBlog.typeName,
      typeNames,
      CreateSectionViewer(getSectionType),
      CreateSectionEditor({ getSectionFileContent }),
      ExternalBlogViewer,
      {
        defaultSections: [`-${SectionNames.summary}`, `-${SectionNames.path}`],
        fixedSections: true
      }, Langs, TypeDefaultConfigs)
  }
}
