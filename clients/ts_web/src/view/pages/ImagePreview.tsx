import './ImagePreview.less'
import { Button } from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import React from 'react'
import { useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import QrCode from '../../infrac/components/QrCode'

export default function ImagePreview (props: {url: string, width?:number, link?:string, onClose?: ()=>void}) {
  const locate = useServicesLocate()
  return <>
    <div className="img-preview-wraper" onClick={props.onClose}>
      <div></div>
      <div className="image-preview " >
        <div className="menus">
          <a className="title" href={props.url} download={'download.png'}>
            <Button type="link" size="large" icon={<SaveOutlined />}>
              {locate(ILangsService).get(LangKeys.ImageSave)}
            </Button>
          </a>
          {
            props.link ? <a href={props.link}>
              <QrCode content={props.link}></QrCode>
            </a> : undefined
          }
        </div>
        <div className="img-panel" >
          <img style={props.width ? { width: props.width } : undefined } src={props.url}></img>
        </div>
      </div>
      <div></div>
    </div>
  </>
}
