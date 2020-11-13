import './H5LiveViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { Button } from 'antd'
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import { generateFileService } from '../../../view/pages/iframeutils'
import { SectionNames } from './Sections'
import { srcToUrl } from '../../../infrac/Lang/srcToUrl'
import { useServicesLocator } from '../../../view/common/Contexts'
import Article, { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import ConfigKeys from '../../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../../domain/ServiceInterfaces/IConfigsSercice'
import IFrameWithJs, { generateContext, IFrameContext } from '../../../infrac/components/IFrameWithJs'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'
import React, { memo, useEffect, useState } from 'react'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'
import YAML from 'yaml'

interface IFramework{
  html?:string;
  css?:string;
  js?:string;
}

interface IData{
  contentUrl?:string;
   jsContentUrl?:string;
    hasData?:boolean;
     context?:IFrameContext;
}
const converter = async (article:Article):Promise<IFramework> => {
  const sections = new Map(article?.content?.sections?.map(s => [s.name!, s]))
  const html = sections.get(SectionNames.html)?.content
  const css = sections.get(SectionNames.css)?.content
  const js = sections.get(SectionNames.js)?.content
  return { html, css, js }
}

const storageFw = 'storage'

const combineContent = async (locator:IServicesLocator, sections: Map<string, ArticleSection>): Promise<IData> => {
  const url = sections.get(SectionNames.url)?.content || ''
  if (url) {
    return { contentUrl: url, jsContentUrl: url }
  }
  const html = sections.get(SectionNames.html)?.content || ''
  const frameworks = sections.get(SectionNames.frameworks)?.content
  const fwNames = frameworks ? Seperators.seperateItems(frameworks) : []
  const storageIdx = fwNames.findIndex(s => s === storageFw)
  if (~storageIdx) {
    fwNames.splice(storageIdx, 1)
  }
  let fws : {name:string, fw?:IFramework}[] = []
  if (fwNames) {
    const articleService = locator.locate(IArticleAppservice)
    const configsService = locator.locate(IConfigsService)
    const fwBase = await configsService.getValueOrDefault(ConfigKeys.FRAMEWORKS_PATH)
    const getFwPath = (name:string) => `${fwBase}/${name}`
    const fwsCache = fwBase
    fws = await Promise.all(fwNames.map(name =>
      articleService.getCacheOrFetch(fwsCache, getFwPath(name), converter).then(fw => ({ name, fw }))))
    const missingFws = fws.filter(f => !f.fw).map(f => f.name)
    if (missingFws.length) {
      console.log('Missing frameworks:', missingFws)
      return {}
    }
  }
  const fwHtml = fws && fws.map(f => f.fw?.html).filter(s => s)
  const fwCss = fws && fws.map(f => f.fw?.css).filter(s => s)
  const fwJs = fws && fws.map(f => f.fw?.js).filter(s => s)
  let jsData = ''
  if (!html && !(fwHtml && fwHtml.length)) {
    return {}
  }
  const style = sections.get(SectionNames.css)?.content
  const script = sections.get(SectionNames.js)?.content
  const data = sections.get(SectionNames.data)?.content
  const dataType = sections.get(SectionNames.data)?.type?.toLocaleLowerCase()
  let hasData = false
  if (data) {
    try {
      switch (dataType) {
        case 'yml':
        case 'yaml':
          jsData = JSON.stringify(YAML.parse(data))
          break
        case 'json':
          jsData = JSON.stringify(JSON.parse(data))
          break
        default:
          jsData = JSON.stringify(data)
      }
    } catch (e) {
      console.log(e)
    }
  }

  let content = ''
  if (fwHtml && fwHtml.length) {
    content += `${fwHtml.join('\n')}\n`
  }
  if (html) {
    content += html + '\n'
  }
  if (fwCss && fwCss.length) {
    content += `<style>\n${fwCss.join('\n')}\n$</style>\n`
  }
  if (style) {
    content += `<style>\n${style}\n$</style>\n`
  }
  let jsContent = ''
  let context: IFrameContext | undefined
  if (~storageIdx) {
    [context, jsContent] = generateContext([generateFileService(locator)])
    jsContent = `<script>\n${jsContent}\n</script>`
  }

  if (fwJs && fwJs.length) {
    jsContent += `<script>\n${fwJs.join('\n')}\n</script>`
  }

  if (jsData) {
    jsContent += `<script>\nwindow.appData=${jsData}\n</script>\n`
    hasData = true
  }

  if (script) {
    jsContent += `<script>\n${script}\n</script>\n`
  }

  jsContent = `${jsContent}\n${content}`

  return { contentUrl: srcToUrl(content), jsContentUrl: jsContent ? srcToUrl(jsContent) : undefined, hasData, context }
}

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
    combineContent(locator, new Map(props.sections.map(s => [s.name!, s]))).then(data => {
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
