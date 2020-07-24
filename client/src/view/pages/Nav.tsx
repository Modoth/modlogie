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
const { SubMenu } = Menu
function Nav() {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const langs = locator.locate(ILangsService)
  const [showDrawer, setShowDrawer] = useState(false)
  const user = useUser()
  const [title, setTitile] = useState(langs.get(LangKeys.Home))
  const fetchTitle = async () => {
    var nameConfig = await locator.locate(IConfigsService).get(ConfigKeys.WEB_SITE_NAME)
    var title = nameConfig?.value || nameConfig?.defaultValue
    if (!title) {
      return
    }
    document.title = title
    setTitile(title)
  }
  useEffect(() => {
    fetchTitle()
  }, [])
  return (
    <>
      <Drawer className="side-nav-panel" visible={showDrawer} onClose={() => setShowDrawer(false)} closable={false} placement="left">
        <Menu className="side-nav" mode="inline" onClick={() => setShowDrawer(false)} >
          {
            plugins.Plugins.flatMap(p => p.types).map(t => <Menu.Item key={t.route} icon={t.icon}>
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

      <Menu mode="horizontal" className={classNames("nav")}>
        <Menu.Item className="nav-open-menu" icon={<MenuOutlined />} onClick={() => setShowDrawer(true)}>
        </Menu.Item>
        <Menu.Item className="nav-home" icon={<HomeOutlined />}>
          <Link to="/">{title}</Link>
        </Menu.Item>
        {user ? (
          <Menu.Item
            className="nav-avatar-icon"
            icon={
              <Avatar
                className="avatar"
                src={user.avatar || '/assets/avatar.png'}
              />
            }
          >
            <Link to="/account"></Link>
          </Menu.Item>
        ) : (
            <Menu.Item className="nav-avatar-icon" icon={<Avatar
              className="avatar"
              src="/assets/logo.png"
            />}>
              <Link to="/account"></Link>
            </Menu.Item>
          )}
      </Menu>
    </>
  )
}

export default Nav
