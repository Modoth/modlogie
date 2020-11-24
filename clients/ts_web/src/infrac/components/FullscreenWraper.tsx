import './FullscreenWraper.less'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import React, { memo, useState } from 'react'
import { useServicesLocator } from '../../view/common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'

export function FullscreenWrap<TProp> (view:{ (props:TProp):JSX.Element}):{ (props:TProp):JSX.Element} {
  // eslint-disable-next-line react/display-name
  return (props:TProp) => {
    return <FullscreenWraper View={view} enabled={true} {...props}></FullscreenWraper>
  }
}

export type FullscreenWraperCallbacks = {toogle?():void}

export default function FullscreenWraper<TProp> (props: TProp & { callbacks?:FullscreenWraperCallbacks, enabled?: boolean, className?: string, View: { (props: TProp): JSX.Element } }) {
  const [fullscreen, setFullscreen] = useState(false)
  const viewService = useServicesLocator().locate(IViewService)
  const [originShowMenu] = useState(viewService.showMenu)
  const [View] = useState(memo(props.View) as any)
  if (props.callbacks) {
    props.callbacks.toogle = () => {
      const nextFullscreen = !fullscreen
      viewService.setShowMenu(nextFullscreen ? false : originShowMenu)
      setFullscreen(nextFullscreen)
    }
  }
  return <div className={classNames(props.className, 'fullscreen-wraper', fullscreen ? 'fullscreen' : '')}><View {...Object.assign({}, props, { classNames: undefined, View: undefined, enabled: undefined })}></View>
    {props.enabled ? <div className="float-menu">
      <Button size="large" type="link" onClick={(ev) => {
        ev.stopPropagation()
        setFullscreen(!fullscreen)
      }}
      icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}>
      </Button>
    </div> : undefined}
  </div>
}
