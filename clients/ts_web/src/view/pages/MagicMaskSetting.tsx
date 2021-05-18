import './MagicMaskSetting.less'
import React, { useEffect, useState } from 'react'
import { useMagicMask, useServicesLocate } from '../common/Contexts'
import { Button, Radio } from 'antd'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import { FormatPainterOutlined } from '@ant-design/icons'

export default function MagicMaskSetting (props: { onClose?(): void }) {
  const magicMask = useMagicMask()
  const locate = useServicesLocate()
  const lang = locate(ILangsService)
  const [masks] = useState(() => {
    return [lang.get(LangKeys.MagicMaskNone), lang.get(LangKeys.MagicMaskNormal), lang.get(LangKeys.MagicMaskHigh)]
  })
  return <div className="magic-mask-setting">
    <Button icon={<FormatPainterOutlined />} size="large" className="magic-mask-setting-label" type="link">{lang.get(LangKeys.MagicMaskLevel)} </Button>
    <Radio.Group onChange={(e) => {
            locate(IViewService).setMagicMask!(e.target.value || 0)
            props.onClose?.()
    }} value={magicMask}>
      {
        masks.map((value, key) => <Radio key={value} value={key}>{value}</Radio>)
      }
    </Radio.Group>
  </div>
}
