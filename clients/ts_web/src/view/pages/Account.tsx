import React, { useState, useEffect } from 'react'
import './Account.less'
import { useUser, useServicesLocator } from '../Contexts'
import { Button, Avatar } from 'antd'
import { Redirect, Link } from 'react-router-dom'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ILoginAppservice from '../../app/Interfaces/ILoginAppservice'
import IViewService from '../../app/Interfaces/IViewService'
import defaultLogo from '../assets/logo.png'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import ReactMarkdown from 'react-markdown'

export default function Account() {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const loginService = locator.locate(ILoginAppservice)
  const viewService = locator.locate(IViewService)
  const [siteName, setSiteName] = useState('')
  const [siteDesc, setSiteDesc] = useState('')
  const [logo, setLogo] = useState('')
  const [avatar, setAvatar] = useState('')
  const [allowLogin, setAllowLogin] = useState(false)
  const changeUserName = () => {
    viewService.prompt(
      langs.get(LangKeys.ChangeName),
      [
        {
          type: 'Text',
          value: user.name,
          hint: langs.get(LangKeys.Name)
        },
        {
          type: 'Password',
          value: '',
          hint: langs.get(LangKeys.Password)
        }
      ],
      async (newName: string, password: string) => {
        if (!newName || newName === user.name || !password) {
          return
        }
        try {
          await locator.locate(ILoginAppservice).updateName(newName, password);
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      })
  }

  const changePassword = () => {
    viewService.prompt(
      langs.get(LangKeys.ChangePassword),
      [
        {
          type: 'Password',
          value: '',
          hint: langs.get(LangKeys.Password)
        },
        {
          type: 'Password',
          value: '',
          hint: langs.get(LangKeys.NewPassword)
        },
        {
          type: 'Password',
          value: '',
          hint: langs.get(LangKeys.NewPassword)
        }
      ],
      async (password: string, newPassword1: string, newPassword2: string) => {
        if (newPassword1 !== newPassword2) {
          return
        }
        if (!password || !newPassword1 || password === newPassword1) {
          return
        }
        try {
          await locator.locate(ILoginAppservice).updatePassword(password, newPassword1);
          return true
        } catch (e) {
          viewService!.errorKey(langs, e.message)
        }
      })
  }
  const onComponentDidMount = async () => {
    let configService = locator.locate(IConfigsService);
    let name = await configService.getValueOrDefault(ConfigKeys.WEB_SITE_NAME)
    let desc = await configService.getValueOrDefault(ConfigKeys.WEB_SITE_DESCRIPTION)
    let logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo;
    let avatar = await configService.getResource(ConfigKeys.WEB_SITE_AVATAR);
    let allowLogin = await configService.getValueOrDefaultBoolean(ConfigKeys.ALLOW_LOGIN);
    setSiteName(name)
    setSiteDesc(desc)
    setLogo(logo)
    setAvatar(avatar || logo)
    setAllowLogin(allowLogin);
  }
  useEffect(() => {
    onComponentDidMount()
  }, [])

  if (!user.name) {
    return (
      <div className="account">
        <div className="avatar-wraper">
          {logo ? <Avatar className="avatar" src={logo} /> : null}
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
          <Link to={'/login'}>{langs.get(allowLogin ? LangKeys.Login : LangKeys.AdmLogin)}</Link>
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
        {logo ? <Avatar className="avatar" src={avatar} /> : null}
      </div>
      <Button
        className="user-name"
        size="large"
        type="text"
        onClick={user.editingPermission ? undefined : changeUserName}
      >
        {user.name}
      </Button>
      {user.editingPermission ? null :
        <Button
          className="user-name"
          size="large"
          type="text"
          onClick={changePassword}
        >
          {langs.get(LangKeys.ChangePassword)}
        </Button>}
      <Button className="btn logout-btn" danger type="primary" onClick={logOut}>
        {langs.get(LangKeys.Logout)}
      </Button>
    </div>
  )
}
