import './WikiLevelSetting.less'
import React, { useState } from 'react'
import { useWikiLevel, useServicesLocate } from '../common/Contexts'
import { Button, Radio } from 'antd'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import { WikiLevels } from '../../domain/ServiceInterfaces/IWikiService'

export default function WikiLevelSetting (props: { onClose?(): void }) {
  const wikiLevel = useWikiLevel()
  const locate = useServicesLocate()
  const lang = locate(ILangsService)
  const [masks] = useState(() => {
    return [lang.get(LangKeys.WikiLevelLow), lang.get(LangKeys.WikiLevelNormal), lang.get(LangKeys.WikiLevelHigh)]
  })
  return <div className="wiki-level-setting">
    <Button size="large" className="wiki-level-setting-label" type="link"><span className="wiki-element">{lang.get(LangKeys.WikiLevel)}</span></Button>
    <Radio.Group onChange={(e) => {
            locate(IViewService).setWikiLevel!(e.target.value || 0)
            props.onClose?.()
    }} value={wikiLevel}>
      {
        masks.map((value, idx) => <Radio key={value} value={WikiLevels[idx]}>{value}</Radio>)
      }
    </Radio.Group>
  </div>
}
