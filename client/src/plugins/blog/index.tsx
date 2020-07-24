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

  get types(): ArticleType[] {
    return this.articleTypes;
  }
  get defaultConfigs(): Config[] {
    return BlogDefaultConfigs;
  }

  async init(configs: IConfigsService): Promise<any> {
    var groups = await configs.getValuesOrDefault(BlogConfigKeys.BLOG_TYPES)
    this.articleTypes = groups.map(group => {
      var noTitle = group.startsWith('_');
      if (noTitle) {
        group = group.slice(1)
      }
      return {
        route: group,
        name: group,
        rootSubject: group,
        noTitle,
        icon: <BookOutlined />,
        Viewer: memo(BlogViewer) as any,
        Editor: memo(BlogEditor) as any,
      }
    })
  }

  get langs(): { [key: string]: string } {
    return Langs
  }
}
