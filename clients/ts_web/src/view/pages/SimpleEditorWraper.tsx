import { extname } from '../../infrac/Lang/pathutils'
import { useServicesLocator } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFrameWithJs from '../../plugins/h5/view/IFrameWithJs'
import React, { useEffect, useState } from 'react'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

export interface SimpleFile{
  name:string,
  size(): Promise<number>,
  read(count?:number): Promise<[ArrayBuffer, boolean]>
}

export interface SimpleViewerWraperProps{
    file:SimpleFile
    type?:string
}

export interface SimpleEditorWraperProps extends SimpleViewerWraperProps{
    readonly?:boolean;
    onSave?(buffer:ArrayBuffer):void
}

let viewerTypes:Promise<ViewerType[]>

const nonViewer = { name: '', accept: '' }

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
      types.push({ name, accept: new RegExp(str, 'i') })
    } catch (e) {
      console.log('invalid config', cfgStr, str)
    }
  }
  return types
}

const converter = async (article:Article):Promise<string> => {
  const sections = new Map(article?.content?.sections?.map(s => [s.name!, s]))
  const html = sections.get('html')?.content
  const css = sections.get('css')?.content
  const js = sections.get('js')?.content
  return `${html || ''}\n<style>\n${css || ''}\n</style>\n<script>\n${js || ''}\n</script>\n`
}

export function SimpleTypeViewer (props:SimpleViewerWraperProps) {
  const [url, setUrl] = useState('')
  const locator = useServicesLocator()
  const fetchViewer = async () => {
    const articleService = locator.locate(IArticleAppservice)
    const configsService = locator.locate(IConfigsService)
    const viewerbase = await configsService.getValueOrDefault(ConfigKeys.VIEWER_PATH)
    const url = await articleService.getCacheOrFetch(viewerbase, `${viewerbase}/${props.type!}`, converter)
    setUrl(url || '')
  }
  useEffect(() => {
    fetchViewer()
  }, [])
  if (!url) {
    return <></>
  }
  return <IFrameWithJs src={url}/>
}

export function SimpleViewerWraper (props:SimpleViewerWraperProps) {
  const locator = useServicesLocator()
  const [type, setType] = useState(props.type)
  const fetchType = async () => {
    const ext = extname(props.file.name)
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
  return <SimpleTypeViewer {...props}/>
}

export function SimpleEditorWraper (props:SimpleEditorWraperProps) {
  const locator = useServicesLocator()
  if (props.readonly) {
    return <SimpleViewerWraper {...props} />
  }
  return <></>
}
