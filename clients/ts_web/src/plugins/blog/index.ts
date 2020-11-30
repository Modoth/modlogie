import { getSectionFileContent, getPasteSectionContent } from './view/Sections'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import MarkdownViewer from './view/MarkdownViewer'
import PluginInfoBase from '../../pluginbase/base'
import PlainViewer from './view/PlainViewer'

export default class Blog extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Blog' }
  constructor (typeNames: string[]) {
    super(Blog.typeName,
      typeNames,
      MarkdownViewer,
      CreateSectionEditor({ getSectionFileContent, getPasteSectionContent }), undefined,
      {
        generators: new Map([['plain', PlainViewer]])
      })
  }
}
