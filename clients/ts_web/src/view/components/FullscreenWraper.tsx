import { Button } from 'antd'
import React, { useState } from 'react'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import './FullscreenWraper.less'

export default function FullscreenWraper<TProp>(props: TProp & { enable?: boolean, className?: string, View: { (props: TProp): JSX.Element } }) {
    const [fullscreen, setFullscreen] = useState(false)

    return <div className={classNames(props.className, "fullscreen-wraper", fullscreen ? "fullscreen" : "")}><props.View {...props}></props.View>
        {props.enable ? <div className="float-menu">
            <Button size="large" type="link" onClick={() => setFullscreen(!fullscreen)}
                icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}>
            </Button>
        </div> : undefined}
    </div>
}