import './FullscreenWraper.less'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import React, { memo, useState } from 'react'

export default function FullscreenWraper<TProp> (props: TProp & { enabled?: boolean, className?: string, View: { (props: TProp): JSX.Element } }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [View] = useState(memo(props.View) as any)
  return <div className={classNames(props.className, 'fullscreen-wraper', fullscreen ? 'fullscreen' : '')}><View {...Object.assign({}, props, { classNames: undefined, View: undefined, enabled: undefined })}></View>
    {props.enabled ? <div className="float-menu">
      <Button size="large" type="link" onClick={() => setFullscreen(!fullscreen)}
        icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}>
      </Button>
    </div> : undefined}
  </div>
}
