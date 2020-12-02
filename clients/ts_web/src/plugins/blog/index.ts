import { getSectionFileContent, getPasteSectionContent } from './view/Sections'
import { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import MarkdownViewer from './view/MarkdownViewer'
import PluginInfoBase from '../../pluginbase/base'
import WxGenerator from './view/WxGenerator'

// eslint-disable-next-line import/no-webpack-loader-syntax
import WxPreview from '!!raw-loader!./view/WxPreview.html'

export default class Blog extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'Blog' }
  constructor (typeNames: string[]) {
    super(Blog.typeName,
      typeNames,
      MarkdownViewer,
      CreateSectionEditor({ getSectionFileContent, getPasteSectionContent }), undefined,
      {
        publishGenerators: new Map([[LangKeys.PUBLISH_WX, { generator: WxGenerator, previewTemplate: WxPreview }]])
      })
  }
}
