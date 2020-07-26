import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import BlogViewer from './view/BlogViewer'
import BlogEditor from './view/BlogEditor'
import { ApiOutlined, BookOutlined } from '@ant-design/icons'
import Langs from './Langs'
import IConfigsService, { Config } from '../../domain/IConfigsSercice'
import BlogConfigKeys from './BlogConfigKeys'
import BlogDefaultConfigs from './BlogDefaultConfigs'

export default class BlogPluginInfo implements IPluginInfo {
  private articleTypes: ArticleType[] = [];

  constructor(typeNames: string[]) {
    this.articleTypes = typeNames.map(name => {
      var noTitle = name.startsWith('_');
      if (noTitle) {
        name = name.slice(1)
      }
      return {
        route: name,
        name: name,
        rootSubject: name,
        noTitle,
        icon: <BookOutlined />,
        Viewer: memo(BlogViewer) as any,
        Editor: memo(BlogEditor) as any,
      }
    })
  }

  get types(): ArticleType[] {
    return this.articleTypes;
  }
  get defaultConfigs(): Config[] {
    return BlogDefaultConfigs;
  }

  async init(configs: IConfigsService): Promise<any> {
    // var groups = await configs.getValuesOrDefault(BlogConfigKeys.BLOG_TYPES)
  }

  get langs(): { [key: string]: string } {
    return Langs
  }
}
