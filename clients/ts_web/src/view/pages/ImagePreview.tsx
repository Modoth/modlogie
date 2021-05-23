import './ImagePreview.less'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import React from 'react'
import { useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'

export default function ImagePreview (props: {url: string, onClose?: ()=>void}) {
  const locate = useServicesLocate()
  return <>
    <div className="img-preview-wraper" onClick={props.onClose}>
      <div className="image-preview " >
        <div className="menus">
          <span className="title">{locate(ILangsService).get(LangKeys.ImageSave)}</span>
          <a href={props.url} download={'download.png'}><Button type="link" size="large" icon={<SaveOutlined />}></Button></a>
        </div>
        <div className="img-panel" >
          <img src={props.url}></img>
        </div>
      </div>
    </div>
  </>
}
