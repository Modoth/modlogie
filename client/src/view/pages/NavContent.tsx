import React from 'react'
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

function NavContent() {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  return (
    <Switch>
      {
        plugins.Plugins.flatMap(p => p.types).map(t => <Route key={t.route} path={'/' + t.route + '/:subjectId?'}>
          <Library type={t} />
        </Route>)
      }
      <Route path="/account">
        <Account />
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
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  )
}

export default NavContent
