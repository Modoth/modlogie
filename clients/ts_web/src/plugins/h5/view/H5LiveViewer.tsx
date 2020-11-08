import './H5LiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import { SectionNames } from './Sections'
import classNames from 'classnames'
import FrameWorks from './frameworks'
import IFrameWithJs, { generateContext, IFrameContext } from './IFrameWithJs'
import React, { useState } from 'react'
import YAML from 'yaml'

const getDataUrl = (content: string) => {
  return 'data:text/html;charset=utf-8,' + encodeURIComponent(content)
}

const combineContent = (sections: Map<string, ArticleSection>): [string | undefined, string | undefined, IFrameContext | undefined] => {
  const html = sections.get(SectionNames.html)?.content || ''
  const frameworks = sections.get(SectionNames.frameworks)?.content
  const fwNames = frameworks ? frameworks.split(' ').filter(s => s) : []
  const fws = fwNames.filter(s => s && FrameWorks.has(s)).map(s => FrameWorks.get(s))
  const fwHtmls = fws && fws.map(f => f && f.html)
  const fwJss = fws && fws.map(f => f && f.js)
  let jsData = ''
  if (!html && !(fwHtmls && fwHtmls.length)) {
    return [undefined, undefined, undefined]
  }
  const style = sections.get(SectionNames.css)?.content
  const script = sections.get(SectionNames.js)?.content
  const data = sections.get(SectionNames.data)?.content

  if (data) {
    try {
      jsData = JSON.stringify(YAML.parse(data))
    } catch (e) {
      console.log(e)
    }
  }

  let content = html || ''
  let jsContent = ''
  let context: IFrameContext | undefined
  if (~fwNames.indexOf('storage')) {
    [context, jsContent] = generateContext()
  }
  if (style) {
    content += `\n<style>\n${style}\n</style>`
  }
  if (fwHtmls && fwHtmls.length) {
    content += `\n${fwHtmls.join('\n')}\n`
  }

  if (jsData) {
    jsContent += `<script>\nwindow.appData=${jsData}\n</script>\n`
  }
  if (fwJss && fwJss.length) {
    jsContent += `<script>\n${fwJss.join('\n')}\n</script>`
  }

  if (script) {
    jsContent += `<script>\n${script}\n</script>\n`
  }

  jsContent = `${content}\n${jsContent}`

  return [getDataUrl(content), jsContent ? getDataUrl(jsContent) : undefined, context]
}

function IFrameWithoutJs (props: { src: string }) {
  return <iframe src={props.src} sandbox=""></iframe>
}

export default function H5LiveViewer (props: AdditionalSectionViewerProps) {
  const [contentUrl, jsContentUrl, context] = combineContent(new Map(props.sections.map(s => [s.name!, s])))
  const [running, setRunning] = useState(false)
  const [canRunning] = useState(!!jsContentUrl)
  const [fullscreen, setFullscreen] = useState(false)
  if (!((running && jsContentUrl) || (!running && contentUrl))) {
    return <></>
  }
  return <div className={classNames('h5-live-viewer', fullscreen ? 'fullscreen' : '')}>
    {
      running
        ? <IFrameWithJs src={jsContentUrl!} context={context} />
        : <IFrameWithoutJs src={contentUrl!} />
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
