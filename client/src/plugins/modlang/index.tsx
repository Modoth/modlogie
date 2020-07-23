import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import { BookOutlined } from '@ant-design/icons'
import ArticleViewer from './view/ArticleViewer';
import ArticleEditor from './view/ArticleEditor';
import IConfigsService, { Config } from '../../domain/IConfigsSercice';
import ModlangDefaultConfigs from './ModlangDefaultConfigs';
import ModlangConfigKeys from './ModlangConfigKeys';

export class ModlangPluginInfo implements IPluginInfo {
  private articleTypes: ArticleType[] = [];
  get types(): ArticleType[] {
    return this.articleTypes;
  }
  get defaultConfigs(): Config[] {
    return ModlangDefaultConfigs;
  }

  get langs(): { [key: string]: string } {
    return {}
  }

  async init(configs: IConfigsService): Promise<any> {
    var groupsConfig = await configs.get(ModlangConfigKeys.MODLANG_TYPES)
    if (!groupsConfig) {
      return
    }
    var configValue = groupsConfig.value || groupsConfig.defaultValue
    if (!configValue) {
      return
    }
    var groups = configValue.split(' ').map(g => g.trim()).filter(g => g);
    this.articleTypes = groups.map(group => (
      {
        route: group,
        name: group,
        rootSubject: group,
        icon: <BookOutlined />,
        Viewer: memo(ArticleViewer) as any,
        Editor: memo(ArticleEditor) as any,
      }
    ))
  }
}
