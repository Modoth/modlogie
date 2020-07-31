import React, { useEffect, useState } from 'react'
import './Nav.less'
import { Link } from 'react-router-dom'
import { useUser, useServicesLocator } from '../../app/Contexts'
import { Menu, Avatar, Drawer } from 'antd'
import {
  UserOutlined,
  HomeOutlined,
  ApiOutlined,
  MenuOutlined,
  SettingOutlined,
  TagsOutlined
} from '@ant-design/icons'
import ILangsService, { LangKeys } from '../../domain/ILangsService'
import { generateRandomStyle } from './common'
import classNames from 'classnames'
import ITagsService, { TagNames } from '../../domain/ITagsService'
import IConfigsService from '../../domain/IConfigsSercice'
import ConfigKeys from '../../app/ConfigKeys'
import { PluginsConfig } from '../../plugins/IPluginInfo'

import defaultLogo from '../../assets/logo.png'
import IViewService from '../services/IViewService'

const { SubMenu } = Menu
function Nav() {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const langs = locator.locate(ILangsService)
  const [showDrawer, setShowDrawer] = useState(false)
  const user = useUser()
  const [title, setTitile] = useState('')
  const [logoTitleImg, setLogoTitleImg] = useState('')
  const [logo, setLogo] = useState('')
  const [avatar, setAvatar] = useState('')
  const onComponentDidMount = async () => {
    const configService = locator.locate(IConfigsService)
    var nameConfig = await configService.get(ConfigKeys.WEB_SITE_NAME)
    var title = nameConfig?.value || nameConfig?.defaultValue || langs.get(LangKeys.Home)
    var logoTitle = await configService.getResource(ConfigKeys.WEB_SITE_LOGO_TITLE);
    var logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo;
    var avatar = await configService.getResource(ConfigKeys.WEB_SITE_AVATAR);
    document.title = title
    setTitile(title)
    setLogoTitleImg(logoTitle!)
    setLogo(logo);
    setAvatar(avatar || logo);
    document.getElementById('icon')?.remove()
    document.getElementById('apple-touch-icon')?.remove()
    let icon = document.createElement('link');
    icon.id = 'icon'
    icon.rel = 'icon'
    icon.type = 'image/x-icon'
    icon.href = logo;
    document.head.appendChild(icon)

    let appTouchIcon = document.createElement('link');
    appTouchIcon.id = 'apple-touch-icon'
    appTouchIcon.rel = 'apple-touch-icon'
    appTouchIcon.href = logo;
    document.head.appendChild(appTouchIcon)
  }
  useEffect(() => {
    onComponentDidMount()
  }, [])

  const [showMenu, setShowMenu] = useState(locator.locate(IViewService).showMenu);
  locator.locate(IViewService).onShowMenuChanged = (s) => s === showMenu || setShowMenu(s);
  return (
    <>
      <Drawer className="side-nav-panel" visible={showDrawer} onClose={() => setShowDrawer(false)} closable={false} placement="left">
        <Menu className="side-nav" mode="inline" onClick={() => setShowDrawer(false)} >
          {
            plugins.Plugins.flatMap(p => p.types).filter(t => (!t.hiddenFromMenu) || user).map(t => <Menu.Item key={t.route} icon={t.icon}>
              <Link to={'/' + t.route}>{t.name}</Link>
            </Menu.Item>)
          }
          {user ? (
            <SubMenu
              icon={<SettingOutlined />}
              title={langs.get(LangKeys.Manage)}
            >
              <Menu.Item icon={<ApiOutlined />}>
                <Link to="/manage/subjects">
                  {langs.get(LangKeys.Subject)}
                </Link>
              </Menu.Item>
              <Menu.Item icon={<TagsOutlined />}>
                <Link to="/manage/tags">{langs.get(LangKeys.Tags)}</Link>
              </Menu.Item>
              <Menu.Item icon={<TagsOutlined />}>
                <Link to="/manage/configs">{langs.get(LangKeys.Configs)}</Link>
              </Menu.Item>
            </SubMenu>
          ) : null}
        </Menu>
      </Drawer>

      <Menu mode="horizontal" className={classNames("nav", showMenu ? '' : 'hidden')}>
        <Menu.Item className="nav-open-menu" icon={<MenuOutlined />} onClick={() => setShowDrawer(true)}>
        </Menu.Item>
        {
          logoTitleImg ? <Menu.Item className="nav-home" icon={<img
            src={logoTitleImg}
          />}>
            <Link to="/"></Link>
          </Menu.Item> : (title ? <Menu.Item className="nav-home" icon={<img
            src={logo}
          />}>
            <Link to="/">{title}</Link>
          </Menu.Item> : null)
        }
        {user ? (
          <Menu.Item
            className="nav-avatar-icon"
            icon={
              <img
                src={avatar}
              />
            }
          >
            <Link to="/account"></Link>
          </Menu.Item>
        ) : (
            <Menu.Item className="nav-logo-icon" icon={<UserOutlined />}>
              <Link to="/account"></Link>
            </Menu.Item>
          )}
      </Menu>
    </>
  )
}

export default Nav
