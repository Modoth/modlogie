import './H5LiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { buildIframeData, IData } from '../../../view/pages/iframeutils'
import { useArticleEnv, useServicesLocator } from '../../../view/common/Contexts'
import classNames from 'classnames'
import IFrameWithJs from '../../../infrac/components/IFrameWithJs'
import IFrameWithoutJs from '../../../infrac/components/IFrameWithoutJs'
import React, { memo, useEffect, useState } from 'react'

const IFrameWithJsMemo = memo(IFrameWithJs)
const IFrameWithoutJsMemo = memo(IFrameWithoutJs)

export default function H5LiveViewer (props: AdditionalSectionViewerProps) {
  const [data, setData] = useState<IData|undefined>()
  const env = useArticleEnv()
  const withMask = !!(env && env.blurBG)
  const [running, setRunning] = useState(false)
  const [canRunning, setCanRunning] = useState(false)
  const locator = useServicesLocator()
  const reload = () => {
    buildIframeData(new Map(props.sections.map(s => [s.name!, s])), { locator, id: props.articleId, defaultFws: [], apiInfos: [], reload }).then(data => {
      if (data) {
        setData(data)
        setRunning(!data.docWithoutJs)
        setCanRunning(!!data.doc)
      }
    })
  }
  useEffect(() => reload(), [])
  if (!data) {
    return <></>
  }
  const { docWithoutJs, doc, context, contextWithoutJs } = data
  if (!((running && doc) || (!running && docWithoutJs))) {
    return <></>
  }
  return <div className={classNames('h5-live-viewer')}>
    {
      running
        ? <IFrameWithJsMemo key={context?.token} withMask={withMask} allowFullscreen={true} srcDoc={doc!} context={context} />
        : (contextWithoutJs
          ? <IFrameWithJsMemo key={contextWithoutJs?.token} withMask={withMask} allowFullscreen={!canRunning} srcDoc={docWithoutJs!} context={contextWithoutJs} />
          : <IFrameWithoutJsMemo withMask={withMask} allowFullscreen={!canRunning} srcDoc={docWithoutJs!} />)
    }
    {running ? undefined : <div onClick={(e) => {
      e.stopPropagation()
      if (canRunning) {
        setRunning(true)
      }
    }} className="mask" ></div>}
  </div>
}
