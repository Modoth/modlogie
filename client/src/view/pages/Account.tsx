import React, { useState, useEffect } from 'react'
import './Account.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Button, Avatar } from 'antd'
import { Redirect, Link } from 'react-router-dom'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import ILoginService from '../../app/ILoginService'
import IViewService from '../services/IViewService'
import logoImg from '../../assets/logo.png'
import avatarImg from '../../assets/avatar.png'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'
import ReactMarkdown from 'react-markdown'

export default function Account() {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const loginService = locator.locate(ILoginService)
  const viewService = locator.locate(IViewService)
  const [siteName, setSiteName] = useState('')
  const [siteDesc, setSiteDesc] = useState('')
  const [logoImg, setLogoImg] = useState('')
  const onComponentDidMount = async () => {
    var configService = locator.locate(IConfigsService);
    var name = await configService.getValueOrDefault(ConfigKeys.WEB_SITE_NAME)
    var desc = await configService.getValueOrDefault(ConfigKeys.WEB_SITE_DESCRIPTION)
    var logoIcon = await configService.getResource(ConfigKeys.WEB_SITE_LOGO);
    setSiteName(name)
    setSiteDesc(desc)
    setLogoImg(logoIcon || avatarImg)
  }
  useEffect(() => {
    onComponentDidMount()
  }, [])

  if (!user) {
    return (
      <div className="account">
        <div className="avatar-wraper">
          {logoImg ? <Avatar className="avatar" src={logoImg} /> : null}
        </div>
        {
          siteName ? <Button
            className="welcome-title"
            size="large"
            type="text"
          >
            {langs.get(LangKeys.Welcome)}
          </Button> : null
        }
        {
          siteDesc ? <ReactMarkdown className="welcome-content" source={siteDesc}></ReactMarkdown> : null
        }

        <Button
          className="adm-login"
          size="small"
          type="text"
        >
          <Link to={'/login'}>{langs.get(LangKeys.AdmLogin)}</Link>
        </Button>
      </div>
    )
  }

  const logOut = async () => {
    viewService!.setLoading(true)
    await loginService!.logout()
    viewService!.setLoading(false)
  }

  return (
    <div className="account">
      <div className="avatar-wraper">
        {logoImg ? <Avatar className="avatar" src={logoImg} /> : null}
      </div>
      <Button
        className="user-name"
        size="large"
        type="text"
      >
        {user.name}
      </Button>
      <Button className="btn logout-btn" danger type="primary" onClick={logOut}>
        {langs.get(LangKeys.Logout)}
      </Button>
    </div>
  )
}
