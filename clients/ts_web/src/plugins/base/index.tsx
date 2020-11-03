import React, { memo } from 'react'
import IPluginInfo, { ArticleType } from '../IPluginInfo'
import BaseViewer from './view/BaseViewer'
import BaseEditor from './view/BaseEditor'
import { BookOutlined } from '@ant-design/icons'
import IConfigsService, { Config } from '../../domain/IConfigsSercice'
import DefaultConfigs from './DefaultConfigs'
import SectionEditorProps from './view/SectionEditorProps'
import SectionViewerProps, { AdditionalSectionViewerProps } from './view/SectionViewerProps'

export default class PluginInfoBase implements IPluginInfo {
  private articleTypes: ArticleType[] = [];

  constructor(
    public name: string,
    typeNames: string[],
    TSectionViewer?: { (props: SectionViewerProps): JSX.Element },
    TSectionEditor?: { (props: SectionEditorProps): JSX.Element },
    TAdditionalSectionsViewer?: { (props: AdditionalSectionViewerProps): JSX.Element },
    additionOptions?: Partial<ArticleType>,
    public langs: { [key: string]: string } = {}) {
    this.articleTypes = typeNames.map(typeName => {
      var noTitle = typeName.startsWith('_');
      if (noTitle) {
        typeName = typeName.slice(1)
      }
      return {
        route: typeName,
        name: typeName,
        rootSubject: typeName,
        noTitle,
        icon: <BookOutlined />,
        Viewer: TSectionViewer && memo(BaseViewer(TSectionViewer, name, TAdditionalSectionsViewer)) as any,
        Editor: TSectionEditor && TSectionViewer && memo(BaseEditor(TSectionEditor, TSectionViewer, name)) as any,
        ...(additionOptions || {})
      }
    })
  }

  get types(): ArticleType[] {
    return this.articleTypes;
  }
  get defaultConfigs(): Config[] {
    return DefaultConfigs;
  }

  async init(_: IConfigsService): Promise<any> {
  }
}
