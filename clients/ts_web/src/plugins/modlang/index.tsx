import { LaptopOutlined } from '@ant-design/icons'
import CreateSectionEditor from '../../pluginbase/base/view/SectionEditor'
import CreateSectionViewer from '../../pluginbase/base/view/SectionViewer'
import IPluginInfo from '../../pluginbase/IPluginInfo'
import ModlangViewer from './view/ModlangViewer'
import PluginInfoBase from '../../pluginbase/base'
import React, { memo } from 'react'

const getSectionType = (name: string) => name

export default class ModLang extends PluginInfoBase implements IPluginInfo {
  static get typeName () { return 'ModLang' }
  constructor (typeNames: string[]) {
    super(ModLang.typeName,
      typeNames,
      CreateSectionViewer(getSectionType),
      CreateSectionEditor(),
      undefined,
      {
        icon: <LaptopOutlined />,
        Viewer: memo(ModlangViewer) as any
      })
  }
}
