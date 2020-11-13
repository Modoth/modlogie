import './NavContent.less'
import { ArticleDetail } from './ArticleDetail'
import { ArticleIdRedirect } from './ArticleIdRedirect'
import { ManageConfigs } from './ManageConfigs'
import { ManageKeywords } from './ManageKeywords'
import { ManageSubjects } from './ManageSubjects'
import { ManageTags } from './ManageTags'
import { ManageUsers } from './ManageUsers'
import { PluginsConfig } from '../../pluginbase/IPluginInfo'
import { Switch, Route } from 'react-router-dom'
import { ToolViewer } from './ToolViewer'
import { useServicesLocator } from '../common/Contexts'
import Account from './Account'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import Home from './Home'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import Library from './Library'
import Login from './Login'
import Markdown from '../../infrac/components/Markdown'
import React, { useState, useEffect } from 'react'

function NavContent () {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const [footer, setFooter] = useState('')
  const fetchFooter = async () => {
    const footer = await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.WEB_SITE_FOOTER)
    setFooter(footer)
  }
  useEffect(() => {
    fetchFooter()
  }, [])
  return (
    <Switch>
      {
        plugins.Plugins.flatMap(p => p.types).map(t => <Route key={t.route} path={'/' + t.route}>
          <Library type={t} />
        </Route>)
      }
      <Route path="/account">
        <>
          <Account />
          {
            footer ? <Markdown className="footer" source={footer}></Markdown> : null
          }
        </>
      </Route>
      <Route path="/manage/tags">
        <ManageTags />
      </Route>
      <Route path="/manage/subjects">
        <ManageSubjects />
      </Route>
      <Route path="/manage/configs">
        <ManageConfigs />
      </Route>
      <Route path="/manage/keywords">
        <ManageKeywords />
      </Route>
      <Route path="/manage/users">
        <ManageUsers />
      </Route>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/tools/viewer">
        <ToolViewer />
      </Route>
      <Route path="/articleid/:typeId/:articleId" exact>
        <ArticleIdRedirect />
      </Route>
      <Route path="/article/:path">
        <ArticleDetail />
      </Route>
      <Route path="/">
        <>
          <Home />
          {
            footer ? <Markdown className="footer" source={footer}></Markdown> : null
          }
        </>
      </Route>
    </Switch>
  )
}

export default NavContent
