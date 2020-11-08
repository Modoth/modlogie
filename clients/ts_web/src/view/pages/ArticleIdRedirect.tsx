import { PluginsConfig } from '../../pluginbase/IPluginInfo'
import { useParams, Redirect } from 'react-router-dom'
import { useServicesLocator, useUser } from '../common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export function ArticleIdRedirect (props: {}) {
  const param = useParams<any>()
  const locator = useServicesLocator()
  const user = useUser()
  const [url, setUrl] = useState<any>(undefined)

  useEffect(() => {
    (async () => {
      const viewService = locator.locate(IViewService)
      viewService.setLoading(true)
      const ret = () => {
        viewService.setLoading(false)
      }
      const rootId = param.typeId
      const articleId = param.articleId
      if (!rootId) {
        return ret()
      }
      const config = locator.locate(PluginsConfig)
      const type = (user.editingPermission ? config.AllTypes : config.NormalTypes).find(t => t.rootSubjectId === rootId)
      if (!type) {
        return ret()
      }
      setUrl({ pathname: '/' + type.route, state: { articleId } })
    })()
  }, [])
  if (!url) {
    return <></>
  }
  return <Redirect to={url}></Redirect>
}
