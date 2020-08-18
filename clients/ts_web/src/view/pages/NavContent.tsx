import React, { useState, useEffect } from 'react'
import './NavContent.less'
import Login from './Login'
import { Switch, Route } from 'react-router-dom'
import Account from './Account'
import Library from './Library'
import { ManageTags } from './ManageTags'
import { ManageSubjects } from './ManageSubjects'
import { useServicesLocator } from '../../app/Contexts'
import { PluginsConfig } from '../../plugins/IPluginInfo'
import Home from './Home'
import { ManageConfigs } from './ManageConfigs'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'
import ReactMarkdown from 'react-markdown'
import { ManageUsers } from './ManageUsers'
import { ManageKeywords } from './ManageKeywords'

function NavContent() {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const [footer, setFooter] = useState('')
  const fetchFooter = async () => {
    var footer = await locator.locate(IConfigsService).getValueOrDefault(ConfigKeys.WEB_SITE_FOOTER)
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
            footer ? <ReactMarkdown className="footer" source={footer}></ReactMarkdown> : null
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
      <Route path="/">
        <>
          <Home />
          {
            footer ? <ReactMarkdown className="footer" source={footer}></ReactMarkdown> : null
          }
        </>
      </Route>
    </Switch>
  )
}

export default NavContent
