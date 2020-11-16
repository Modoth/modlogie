import { buildIframeData, genetateFileApi } from './iframeutils'
import { EditorInfo } from '../../app/Interfaces/IEditorsService'
import { useServicesLocator } from '../common/Contexts'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IFile from '../../infrac/Lang/IFile'
import IFrameWithJs, { IFrameContext } from '../../infrac/components/IFrameWithJs'
import React, { memo, useEffect, useState } from 'react'

const IFrameWithJsMemo = memo(IFrameWithJs)

export interface ExternalViewerProps{
    file:IFile
    info:EditorInfo
}

export default function ExternalViewer (props:ExternalViewerProps) {
  const [url, setUrl] = useState('')
  const [context, setContext] = useState<IFrameContext|undefined>()
  const locator = useServicesLocator()
  const fetchViewer = async () => {
    const articleService = locator.locate(IArticleAppservice)
    const article = await articleService.getCacheOrFetch(ConfigKeys.VIEWER_PATH, props.info.path, async a => a)
    if (article) {
      const { jsContentUrl, context } = await buildIframeData(locator, article.id!, new Map(article?.content?.sections?.map(s => [s.name!, s])), [], [genetateFileApi(props.file)])
      setContext(context)
      setUrl(jsContentUrl || '')
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
