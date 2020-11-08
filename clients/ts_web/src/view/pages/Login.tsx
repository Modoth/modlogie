import './Login.less'
import { Input, Space, Button, Switch } from 'antd'
import { Redirect } from 'react-router-dom'
import { UserOutlined } from '@ant-design/icons'
import { useUser, useServicesLocator } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import ILoginAppservice from '../../app/Interfaces/ILoginAppservice'
import IPasswordStorage from '../../domain/ServiceInterfaces/IPasswordStorage'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export default function Login () {
  const user = useUser()
  if (user.name) {
    return <Redirect to="/account" />
  }
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const loginService = locator.locate(ILoginAppservice)
  const notify = locator.locate(IViewService)
  const pwdStorage = locator.locate(IPasswordStorage)
  const [name, setName] = useState((pwdStorage && pwdStorage.name) || '')
  const [pwd, setPwd] = useState((pwdStorage && pwdStorage.password) || '')
  const [autoLogin, setAutoLogin] = useState(pwdStorage && pwdStorage.autoLogin)
  const tryLogin = async () => {
    if (!name || !pwd) {
      console.log(LangKeys.MSG_ERROR_USER_OR_PWD)
      return
    }
    notify!.setLoading(true)
    try {
      await loginService!.login(name, pwd)
    } catch (e) {
      notify!.errorKey(langs, e.message)
    }
    notify!.setLoading(false)
  }
  useEffect(() => {
    if (autoLogin) {
      tryLogin()
    }
  }, [])
  return (
    <Space direction="vertical" className="login">
      <Input
        value={name}
        onChange={(e) => {
          setName(e.target.value)
        }}
        placeholder={langs.get(LangKeys.UserName)}
        suffix={<UserOutlined />}
      />
      <Input.Password
        value={pwd}
        onChange={(e) => {
          setPwd(e.target.value)
        }}
        placeholder={langs.get(LangKeys.Password)}
        onPressEnter={tryLogin}
      />
      {pwdStorage
        ? <Switch className="auto-login" checked={autoLogin} onClick={(e) => {
          pwdStorage.autoLogin = e
          setAutoLogin(pwdStorage.autoLogin)
        }}
        checkedChildren={<span>{langs.get(LangKeys.CancleAutoLogin)}</span>}
        unCheckedChildren={<span>{langs.get(LangKeys.EnableAutoLogin)}</span>}
        ></Switch>
        : null}
      <Button className="login-btn" type="primary" onClick={tryLogin}>
        {langs.get(LangKeys.Login)}
      </Button>
    </Space>
  )
}
