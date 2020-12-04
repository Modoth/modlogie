import './PublishArticle.less'
import { ArticleContentViewerProps } from '../../pluginbase/IPluginInfo'
import { Button } from 'antd'
import { IPublishService } from '../../domain/ServiceInterfaces/IPublishService'
import { srcToUrl } from '../../infrac/Lang/srcToUrl'
import { useServicesLocate } from '../common/Contexts'
import IFrameWithoutJs from '../../infrac/components/IFrameWithoutJs'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState } from 'react'

export default function PublishArticle (props:{
     Template:((props: ArticleContentViewerProps) => string),
     PreviewTemplate?:string,
     publishType:string,
     publishId?:string,
     group:string,
     onPublishIdChanged(id?:string):void,
     articlePath:string
    } & ArticleContentViewerProps) {
  const baseUrl = `${window.location.protocol}//${window.location.host}/`
  const [content] = useState(props.Template(props))
  const [url] = useState(srcToUrl(content.replaceAll(/\$\{FILENAME=(.*?)\}/g, (_, url) =>
  `${baseUrl}${url}`
  )) + (props.PreviewTemplate || ''))
  const [publishId, setPublishId] = useState(props.publishId)
  const locate = useServicesLocate()
  const langs = locate(ILangsService)
  const viewService = locate(IViewService)
  const publishService = locate(IPublishService)
  const publish = async () => {
    if (publishId) {
      return
    }
    try {
      var id = await publishService.publish(props.publishType,
        props.articleId,
        props.group,
        `${window.location.protocol}//${window.location.host}`,
        `/#/article${props.articlePath}`,
        content)
      setPublishId(id)
      props.onPublishIdChanged(id)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    } finally {
      viewService.setLoading(false)
    }
  }
  const canclePublish = async () => {
    if (!publishId) {
      return
    }
    viewService.setLoading(true)
    try {
      await publishService.delete(props.publishType,
        props.articleId,
        publishId)
      setPublishId(undefined)
      props.onPublishIdChanged(undefined)
    } catch (e) {
        viewService!.errorKey(langs, e.message)
    } finally {
      viewService.setLoading(false)
    }
  }
  return <div className="publish-article">
    <div className="preview-wraper"><IFrameWithoutJs src={url} allowFullscreen={true}></IFrameWithoutJs></div>
    <div className="menu">
      {
        publishId
          ? <Button onClick={canclePublish} type="link">{langs.get(LangKeys.CanclePublish)}</Button>
          : <Button onClick={publish} type="link">{langs.get(LangKeys.Publish)}</Button>
      }
    </div>
  </div>
}
