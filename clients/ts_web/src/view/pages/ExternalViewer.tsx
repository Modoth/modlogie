import { buildIframeData, genetateFileApi } from './iframeutils'
import { EditorInfo } from '../../app/Interfaces/IEditorsService'
import { useServicesLocate } from '../common/Contexts'
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
  const [doc, setDoc] = useState('')
  const [context, setContext] = useState<IFrameContext|undefined>()
  const locate = useServicesLocate()
  const reload = async () => {
    const articleService = locate(IArticleAppservice)
    const article = await articleService.getCacheOrFetch(ConfigKeys.VIEWER_PATH, props.info.path, async a => a)
    if (article) {
      const { doc, context } = await buildIframeData(new Map(article?.content?.sections?.map(s => [s.name!, s])), { locate, id: article.id!, defaultFws: [], apiInfos: [genetateFileApi(props.file)], reload: reload })
      setContext(context)
      setDoc(doc || '')
    }
  }
  useEffect(() => {
    reload()
  }, [])
  if (!doc) {
    return <></>
  }
  return <IFrameWithJsMemo key={context?.token} allowFullscreen={true} context={context} srcDoc={doc}/>
}
