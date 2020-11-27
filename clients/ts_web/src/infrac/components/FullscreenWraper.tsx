import './FullscreenWraper.less'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import React, { memo, useEffect, useState } from 'react'
import { useServicesLocate } from '../../view/common/Contexts'
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
  const viewService = useServicesLocate()(IViewService)
  const [View] = useState(memo(props.View) as any)
  const toogle = () => {
    const nextFullscreen = !fullscreen
    viewService.setShowTitle?.(nextFullscreen ? false : undefined)
    setFullscreen(nextFullscreen)
    viewService.setShowFloatingMenu?.(!nextFullscreen)
  }
  if (props.callbacks) {
    props.callbacks.toogle = toogle
  }
  const p :any = Object.assign({}, props)
  delete p.classNames
  delete p.View
  delete p.enabled

  return <div className={classNames(props.className, 'fullscreen-wraper', fullscreen ? 'fullscreen' : '')}>
    <View {...p}></View>
    {props.enabled ? <div className="float-menu">
      <Button size="large" type="link" onClick={(ev) => {
        ev.stopPropagation()
        toogle()
      }}
      icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}>
      </Button>
    </div> : undefined}
  </div>
}
