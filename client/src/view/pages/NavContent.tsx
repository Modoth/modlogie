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
        <>
          <Home />
          {
            footer ? <div className="footer">{footer.split('\\n').map(p => <div>{p}</div>)}</div> : null
          }
        </>
      </Route>
    </Switch>
  )
}

export default NavContent
