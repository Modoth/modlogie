import './PublishArticle.less'
import { ArticleContentViewerProps } from '../../pluginbase/IPluginInfo'
import { Button } from 'antd'
import { IPublishService } from '../../domain/ServiceInterfaces/IPublishService'
import { srcToUrl } from '../../infrac/Lang/srcToUrl'
import { useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState } from 'react'

export default function PublishArticle (props:{
     Template:((props: ArticleContentViewerProps) => string),
     publishType:string,
     publishId?:string,
     onPublishIdChanged(id?:string):void,
     articlePath:string
    } & ArticleContentViewerProps) {
  const baseUrl = `${window.location.protocol}//${window.location.host}/`
  const [content] = useState(props.Template(props).replaceAll(/\$\{FILENAME=(.*?)\}/g, (_, url) =>
  `${baseUrl}${url}`
  ))
  const [publishId, setPublishId] = useState(props.publishId)
  const url = srcToUrl(content)
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
        baseUrl,
           `${baseUrl}#/article/${props.articlePath}`,
           content)
      setPublishId(id)
      props.onPublishIdChanged(id)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    } finally {
      viewService.setLoading(false)
    }
  }
  const canclePublish = () => {
    if (!publishId) {
      return
    }
    viewService.prompt(langs.get(LangKeys.CanclePublish), [],
      async () => {
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
        return true
      })
  }
  return <div className="publish-article">
    <div className="iframe-wraper"><iframe src={url} sandbox=""></iframe></div>
    <div className="menu">
      {
        publishId
          ? <Button onClick={canclePublish}>{langs.get(LangKeys.CanclePublish)}</Button>
          : <Button onClick={publish}>{langs.get(LangKeys.Publish)}</Button>
      }
    </div>
  </div>
}
