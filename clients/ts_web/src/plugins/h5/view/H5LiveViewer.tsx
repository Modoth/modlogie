import './H5LiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { buildIframeData, IData } from '../../../view/pages/iframeutils'
import { useServicesLocator } from '../../../view/common/Contexts'
import classNames from 'classnames'
import IFrameWithJs from '../../../infrac/components/IFrameWithJs'
import IFrameWithoutJs from '../../../infrac/components/IFrameWithoutJs'
import React, { memo, useEffect, useState } from 'react'

const IFrameWithJsMemo = memo(IFrameWithJs)
const IFrameWithoutJsMemo = memo(IFrameWithoutJs)

export default function H5LiveViewer (props: AdditionalSectionViewerProps) {
  const [data, setData] = useState<IData|undefined>()
  const [running, setRunning] = useState(false)
  const [canRunning, setCanRunning] = useState(false)
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
  return <div className={classNames('h5-live-viewer')}>
    {
      running
        ? <IFrameWithJsMemo allowFullscreen={true} src={jsContentUrl!} context={context} />
        : <IFrameWithoutJsMemo allowFullscreen={!canRunning} src={contentUrl!} />
    }
    {running ? undefined : <div onClick={() => {
      if (canRunning) {
        setRunning(true)
      }
    }} className="mask"></div>}
  </div>
}
