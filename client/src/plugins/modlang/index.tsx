import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import { LaptopOutlined } from '@ant-design/icons'
import ModlangViewer from './view/ModlangViewer';
import ModlangEditor from './view/ModlangEditor';
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
    var groups = await configs.getValuesOrDefault(ModlangConfigKeys.MODLANG_TYPES)
    this.articleTypes = groups.map(group => (
      {
        route: group,
        name: group,
        rootSubject: group,
        icon: <LaptopOutlined />,
        Viewer: memo(ModlangViewer) as any,
        Editor: memo(ModlangEditor) as any,
      }
    ))
  }
}
