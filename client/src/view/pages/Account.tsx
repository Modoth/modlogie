import React from 'react'
import './Account.less'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Button, Avatar } from 'antd'
import { Redirect, Link } from 'react-router-dom'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import ILoginService from '../../app/ILoginService'
import IViewService from '../services/IViewService'
export default function Account() {
  const user = useUser()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const loginService = locator.locate(ILoginService)
  const viewService = locator.locate(IViewService)

  if (!user) {
    return (
      <div className="account">
        <div className="avatar-wraper">
          <Avatar className="avatar" src={'/assets/avatar.png'} />
        </div>
        <Button
          className="user-name"
          size="large"
          type="text"
        >
          {langs.get(LangKeys.Welcome)}
        </Button>
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
        <Avatar className="avatar" src={user.avatar || '/assets/avatar.png'} />
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
