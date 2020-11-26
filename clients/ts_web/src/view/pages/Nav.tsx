import './Nav.less'
import { Link } from 'react-router-dom'
import { Menu, Drawer } from 'antd'
import { PluginsConfig } from '../../pluginbase/IPluginInfo'
import { UserOutlined, ReloadOutlined, FileWordOutlined, RocketOutlined, EditOutlined, ReadOutlined, UsergroupAddOutlined, ApiOutlined, MenuOutlined, SettingOutlined, TagsOutlined } from '@ant-design/icons'
import { useUser, useServicesLocator } from '../common/Contexts'
import classNames from 'classnames'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import defaultLogo from '../assets/logo.png'
import defaultIcon from '../assets/icon.png'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IEditorsService, { EditorInfo } from '../../app/Interfaces/IEditorsService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'
import TitleBar from './TitleBar'

const { SubMenu } = Menu
function Nav () {
  const locator = useServicesLocator()
  const plugins = locator.locate(PluginsConfig)
  const langs = locator.locate(ILangsService)
  const [showDrawer, setShowDrawer] = useState(false)
  const user = useUser()
  const [title, setTitile] = useState('')
  const [logoTitleImg, setLogoTitleImg] = useState('')
  const [allowLogin, setAllowLogin] = useState(false)
  const [logo, setLogo] = useState('')
  const [avatar, setAvatar] = useState('')
  const [editors, setEditors] = useState<EditorInfo[]>([])
  const [viewers, setViewers] = useState<EditorInfo[]>([])
  const ref = React.createRef<HTMLDivElement>()
  const [showTitle, setShowTitle] = useState({ last: true, current: true })
  const onComponentDidMount = async () => {
    const configService = locator.locate(IConfigsService)
    const nameConfig = await configService.get(ConfigKeys.WEB_SITE_NAME)
    const title = nameConfig?.value || nameConfig?.defaultValue || langs.get(LangKeys.Home)
    const logoTitle = await configService.getResource(ConfigKeys.WEB_SITE_LOGO_TITLE)
    const logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo
    const siteIcon = await configService.getResource(ConfigKeys.WEB_SITE_ICON) || await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultIcon
    const avatar = await configService.getResource(ConfigKeys.WEB_SITE_AVATAR)
    const allowLogin = await configService.getValueOrDefaultBoolean(ConfigKeys.ALLOW_LOGIN)
    const editorsService = locator.locate(IEditorsService)
    // const editors =  editorsService.getEditors()
    const viewers = editorsService.getViewers()
    setViewers(viewers)
    // setEditors(editors)
    document.title = title
    setTitile(title)
    setLogoTitleImg(logoTitle!)
    setLogo(logo)
    setAvatar(avatar || logo)
    setAllowLogin(allowLogin)
    const existedIcon = document.getElementById('icon')
    if (existedIcon) {
      existedIcon.remove()
    }
    const existedTouch = document.getElementById('apple-touch-icon')
    if (existedTouch) {
      existedTouch.remove()
    }
    const icon = document.createElement('link')
    icon.id = 'icon'
    icon.rel = 'icon'
    icon.type = 'image/x-icon'
    icon.href = logo
    document.head.appendChild(icon)

    const appTouchIcon = document.createElement('link')
    appTouchIcon.id = 'apple-touch-icon'
    appTouchIcon.rel = 'apple-touch-icon'
    appTouchIcon.href = siteIcon
    document.head.appendChild(appTouchIcon)
  }
  useEffect(() => {
    onComponentDidMount()
  }, [])

  locator.locate(IViewService).setShowTitle = (show?:boolean) => {
    if (show === undefined) {
      setShowTitle({ last: showTitle.current, current: showTitle.last })
    } else {
      setShowTitle({ last: showTitle.current, current: show })
    }
    return showTitle.current
  }

  return (
    <div ref={ref} className={classNames(showTitle.current ? '' : 'hidden')}>
      <Drawer className="side-nav-panel" visible={showDrawer} onClose={() => setShowDrawer(false)} closable={false} placement="left">
        <Menu className="side-nav" mode="inline" onClick={() => setShowDrawer(false)} >
          {
            (user?.editingPermission ? plugins.AllTypes : plugins.NormalTypes).map(t =>
              <Menu.Item key={t.route} icon={t.iconUrl ? <img
                src={t.iconUrl}
              /> : t.icon}>
                <Link to={'/' + t.route}>{t.displayName || t.name}</Link>
              </Menu.Item>)
          }
          {user.editingPermission ? <Menu.Divider></Menu.Divider> : undefined}
          {user.editingPermission ? (
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
              <Menu.Item icon={<TagsOutlined />}>
                <Link to="/manage/keywords">{langs.get(LangKeys.Keyword)}</Link>
              </Menu.Item>
              <Menu.Item icon={<UsergroupAddOutlined />}>
                <Link to="/manage/users">{langs.get(LangKeys.User)}</Link>
              </Menu.Item>
            </SubMenu>
          ) : null}
          <Menu.Divider></Menu.Divider>
          <SubMenu
            icon={<RocketOutlined />}
            title={langs.get(LangKeys.Tools)}
          >
            <Menu.Item icon={<FileWordOutlined />} >
              <Link to="/manage/words/">{langs.get(LangKeys.FavoriteWords)}</Link>
            </Menu.Item>
            {
              (viewers && viewers.length)
                ? <Menu.Item icon={<ReadOutlined />} >
                  <Link to="/tools/viewer/">{langs.get(LangKeys.Viewers)}</Link>
                </Menu.Item> : <></>
            }
            {
              (editors && editors.length)
                ? <Menu.Item icon={<EditOutlined />} >
                  <Link to="/tools/editor/">{langs.get(LangKeys.Editors)}</Link>
                </Menu.Item> : <></>
            }
            <Menu.Divider></Menu.Divider>
            <Menu.Item icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              {langs.get(LangKeys.Refresh)}
            </Menu.Item>
          </SubMenu>
          <Menu.Divider></Menu.Divider>
          {user.name ? (
            <Menu.Item
              className="nav-avatar-icon"
              icon={
                <img
                  src={avatar}
                />
              }
            >
              <Link to="/account">{user.name}</Link>
            </Menu.Item>
          ) : (
            <Menu.Item className="nav-logo-icon" icon={<UserOutlined />}>
              <Link to={allowLogin ? '/login' : '/account'}>{langs.get(allowLogin ? LangKeys.Login : LangKeys.About)}</Link>
            </Menu.Item>
          )}
        </Menu>
      </Drawer>

      <TitleBar title={logoTitleImg ? undefined : title} icon={ logoTitleImg || logo} link="/" menus={[
        {
          title: langs.get(LangKeys.Menu),
          onClick: () => setShowDrawer(true),
          icon: <MenuOutlined className="menu-icon"></MenuOutlined>
        }
      ]}></TitleBar>
    </div>
  )
}

export default Nav
