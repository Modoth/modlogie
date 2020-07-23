import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import ProblemViewer from './view/ProblemViewer'
import ProblemEditor from './view/ProblemEditor'
import { ApiOutlined, ApartmentOutlined } from '@ant-design/icons'
import Langs from './Langs'
import IConfigsService, { Config } from '../../domain/IConfigsSercice'

export default class MathPluginInfo implements IPluginInfo {
  private articleTypes: ArticleType[];
  constructor() {
    this.articleTypes = [
      {
        route: 'library',
        name: '题库',
        rootSubject: '数学',
        noTitle: true,
        icon: <ApartmentOutlined />,
        Viewer: memo(ProblemViewer) as any,
        Editor: memo(ProblemEditor) as any,
      },
      {
        route: 'subject',
        name: '专题',
        rootSubject: '数学',
        icon: <ApiOutlined />,
        Viewer: memo(ProblemViewer) as any,
        Editor: memo(ProblemEditor) as any
      }
    ]
  }

  async init(configs: IConfigsService): Promise<any> {
    return
  }

  get langs(): { [key: string]: string } {
    return Langs
  }

  get types(): ArticleType[] {
    return this.articleTypes
  }

  get defaultConfigs(): Config[] {
    return [];
  }
}
