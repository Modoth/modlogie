import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import SectionsBaseViewer from './view/SectionsBaseViewer'
import SectionsBaseEditor from './view/SectionsBaseEditor'
import { ApiOutlined, BookOutlined } from '@ant-design/icons'
import Langs from './Langs'
import IConfigsService, { Config } from '../../domain/IConfigsSercice'
import SectionsBaseDefaultConfigs from './SectionsBaseDefaultConfigs'
import SectionEditorProps from './view/SectionEditorProps'
import SectionViewerProps from './view/SectionViewerProps'

export default class SectionsBasePluginInfo {
  private articleTypes: ArticleType[] = [];

  constructor(TSectionViewer: { (props: SectionViewerProps): JSX.Element }
    , TSectionEditor: { (props: SectionEditorProps): JSX.Element },
    typeNames: string[]) {
    this.articleTypes = typeNames.map(name => {
      var noTitle = name.startsWith('_');
      if (noTitle) {
        name = name.slice(1)
      }
      return {
        route: encodeURIComponent(name),
        name: name,
        rootSubject: name,
        noTitle,
        icon: <BookOutlined />,
        Viewer: memo(SectionsBaseViewer(TSectionViewer)) as any,
        Editor: memo(SectionsBaseEditor(TSectionEditor)) as any,
      }
    })
  }

  get types(): ArticleType[] {
    return this.articleTypes;
  }
  get defaultConfigs(): Config[] {
    return SectionsBaseDefaultConfigs;
  }

  async init(configs: IConfigsService): Promise<any> {
    // var groups = await configs.getValuesOrDefault(BlogConfigKeys.BLOG_TYPES)
  }

  get langs(): { [key: string]: string } {
    return Langs
  }
}
