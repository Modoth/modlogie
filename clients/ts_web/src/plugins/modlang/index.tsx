import { LaptopOutlined } from '@ant-design/icons'
import IPluginInfo from '../IPluginInfo'
import ModlangViewer from './view/ModlangViewer'
import PluginInfoBase from '../base'
import React, { memo } from 'react'
import CreateSectionEditor from '../base/view/SectionEditor'
import CreateSectionViewer from '../base/view/SectionViewer'
const getSectionType = (name: string) => name;

export default class ModLang extends PluginInfoBase implements IPluginInfo {
  static get typeName() { return "ModLang" }
  constructor(typeNames: string[]) {
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