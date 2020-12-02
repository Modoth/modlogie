import { getSectionFileContent, getPasteSectionContent } from './view/Sections'
import { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import MarkdownViewer from './view/MarkdownViewer'
import PlainViewer from './view/PlainViewer'
import PluginInfoBase from '../../pluginbase/base'

// eslint-disable-next-line import/no-webpack-loader-syntax
import WxStyle from '!!raw-loader!./view/Wx.css'

export default class Blog extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Blog' }
  constructor (typeNames: string[]) {
    super(Blog.typeName,
      typeNames,
      MarkdownViewer,
      CreateSectionEditor({ getSectionFileContent, getPasteSectionContent }), undefined,
      {
        publishGenerators: new Map([[LangKeys.PUBLISH_WX, PlainViewer(WxStyle)]])
      })
  }
}
