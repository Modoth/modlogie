import './ImagePreview.less'
import { Button } from 'antd'
import { SaveOutlined, CloseOutlined } from '@ant-design/icons'
import React from 'react'
import { useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import QrCode from '../../infrac/components/QrCode'

export default function ImagePreview (props: {url: string, width?:number, link?:string, onClose?: ()=>void}) {
  const locate = useServicesLocate()
  return <>
    <div className="img-preview-wraper" onClick={props.onClose}>
      <div className="menus">
        <a href={props.url} download={'download.png'}>
          <Button type="link" size="large" icon={<SaveOutlined />}>
          </Button>
        </a>
        <span className="title">{locate(ILangsService).get(LangKeys.ImageSave)}</span>
        {
          props.link ? <a href={props.link}>
            <QrCode content={props.link}></QrCode>
          </a> : <a href={props.url} download={'download.png'}>
            <Button type="link" size="large" danger onClick={props.onClose} icon={<CloseOutlined />}>
            </Button>
          </a>
        }
      </div>
      <div></div>
      <div className="image-preview " >
        <div className="img-panel" >
          <img style={props.width ? { width: props.width } : undefined } src={props.url}></img>
        </div>
      </div>
      <div></div>
    </div>
  </>
}
