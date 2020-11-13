import './ExternalViewer.less'
import { extname } from '../../infrac/Lang/pathutils'
import { genetateFileApi } from './iframeutils'
import { srcToUrl } from '../../infrac/Lang/srcToUrl'
import { useServicesLocator } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFile from '../../infrac/Lang/IFile'
import IFrameWithJs, { generateContext, IFrameContext } from '../../infrac/components/IFrameWithJs'
import React, { memo, useEffect, useState } from 'react'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

const IFrameWithJsMemo = memo(IFrameWithJs)

export interface ExternalViewerProps{
    file:IFile
    type?:string
}

let viewerTypes:Promise<ViewerType[]>

interface ViewerType {
  name:string;
  accept:RegExp
}

const fetchViewerTypes = async (configs:IConfigsService) :Promise<ViewerType[]> => {
  const cfgStr = await configs.getValueOrDefault(ConfigKeys.VIEWER_TYPES)
  const types :ViewerType[] = []
  for (let str of Seperators.seperateItems(cfgStr)) {
    str = str.trim()
    if (!str) {
      continue
    }
    let [name, regStr] = Seperators.seperateFields(str)
    name = name.trim()
    regStr = regStr.trim()
    if (!name || !regStr) {
      continue
    }
    try {
      types.push({ name, accept: new RegExp(regStr, 'i') })
    } catch (e) {
      console.log('invalid config', cfgStr, str)
    }
  }
  return types
}

const generateViewerData = async (article:Article, file:IFile):Promise<[IFrameContext, string]> => {
  const [context, jsContent] = generateContext([genetateFileApi(file)])
  const sections = new Map(article?.content?.sections?.map(s => [s.name!, s]))
  let url = sections.get('url')?.content
  if (url) {
    const html = await (await fetch(url, { mode: 'cors' })).text()
    url = srcToUrl(`<script>\n${jsContent}\n</script>\n${html || ''}\n`)
    return [context, url]
  }
  const html = sections.get('html')?.content
  const css = sections.get('css')?.content
  const js = sections.get('js')?.content
  url = srcToUrl(`${html || ''}\n<style>\n${css || ''}\n</style>\n<script>\n${jsContent}\n${js || ''}\n</script>\n`)
  return [context, url]
}

function ExternalViewerFixedType (props:ExternalViewerProps) {
  const [url, setUrl] = useState('')
  const [context, setContext] = useState<IFrameContext|undefined>()
  const locator = useServicesLocator()
  const fetchViewer = async () => {
    const articleService = locator.locate(IArticleAppservice)
    const configsService = locator.locate(IConfigsService)
    const viewerbase = await configsService.getValueOrDefault(ConfigKeys.VIEWER_PATH)
    const article = await articleService.getCacheOrFetch(viewerbase, `${viewerbase}/${props.type!}`, async a => a)
    if (article) {
      const [context, url] = await generateViewerData(article, props.file)
      setContext(context)
      setUrl(url || '')
    }
  }
  useEffect(() => {
    fetchViewer()
  }, [])
  if (!url) {
    return <></>
  }
  return <IFrameWithJsMemo context={context} src={url}/>
}

export default function ExternalViewer (props:ExternalViewerProps) {
  const locator = useServicesLocator()
  const [type, setType] = useState(props.type)
  const fetchType = async () => {
    const ext = extname(await props.file.name())
    if (!ext) {
      return
    }
    if (!viewerTypes) {
      viewerTypes = fetchViewerTypes(locator.locate(IConfigsService))
    }
    const types = await viewerTypes
    const type = types.find(t => t.accept.test(ext || ''))?.name
    setType(type)
  }
  useEffect(() => {
    if (!type) {
      fetchType()
    }
  }, [])
  if (!type) {
    return <></>
  }
  return <div className="external-viewer"><ExternalViewerFixedType {...props} type={type}/></div>
}
