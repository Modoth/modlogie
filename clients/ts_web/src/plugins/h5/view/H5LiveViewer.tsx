import './H5LiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { buildIframeData, IData } from '../../../view/pages/iframeutils'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../../../view/common/Contexts'
import classNames from 'classnames'
import IFrameWithJs from '../../../infrac/components/IFrameWithJs'
import React, { memo, useEffect, useState } from 'react'

function IFrameWithoutJs (props: { src: string }) {
  return <iframe src={props.src} sandbox=""></iframe>
}

const IFrameWithJsMemo = memo(IFrameWithJs)
const IFrameWithoutJsMemo = memo(IFrameWithoutJs)

export default function H5LiveViewer (props: AdditionalSectionViewerProps) {
  const [data, setData] = useState<IData|undefined>()
  const [running, setRunning] = useState(false)
  const [canRunning, setCanRunning] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const locator = useServicesLocator()
  useEffect(() => {
    buildIframeData(locator, props.articleId, new Map(props.sections.map(s => [s.name!, s])), [], []).then(data => {
      if (data) {
        setData(data)
        setRunning(!!data.hasData)
        setCanRunning(!!data.jsContentUrl)
      }
    })
  }, [])
  if (!data) {
    return <></>
  }
  const { contentUrl, jsContentUrl, hasData, context } = data
  if (!((running && jsContentUrl) || (!running && contentUrl))) {
    return <></>
  }
  return <div className={classNames('h5-live-viewer', fullscreen ? 'fullscreen' : '')}>
    {
      running
        ? <IFrameWithJsMemo src={jsContentUrl!} context={context} />
        : <IFrameWithoutJsMemo src={contentUrl!} />
    }
    {running ? undefined : <div onClick={() => {
      if (canRunning) {
        setRunning(true)
      }
    }} className="mask"></div>}
    <div className="float-menu"><Button size="large" type="link" onClick={() => {
      if (!fullscreen) {
        setRunning(true)
      }
      setFullscreen(!fullscreen)
    }} icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}></Button></div>
  </div>
}
