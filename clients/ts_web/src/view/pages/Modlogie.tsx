import './Modlogie.less'
import { Button } from 'antd'
import { DragOutlined, QuestionOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import classNames from 'classnames'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'
import IViewService from '../../app/Interfaces/IViewService'
import ModlogieView from './ModlogieView'
import React, { useEffect, useState } from 'react'
import registerDragMove, { DragPosition } from '../../infrac/Web/registerDragMove'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import Langs from '../common/Langs'
import ISubjectsService from '../../domain/ServiceInterfaces/ISubjectsService'
import Subject from '../../domain/ServiceInterfaces/Subject'

const LastModlogiePosKey = 'LastModlogiePosKey'

type ModlogiePos = {right:boolean, bottom:number}

const initPos = { right: true, bottom: 20 }

const defaultPos = { right: true, bottom: 20 }

const getContainerStyleFromPos = (pos:ModlogiePos):React.CSSProperties => {
  const style:Partial<CSSStyleDeclaration> = { }
  applyContainerStyleFromPos(style, pos)
  return style
}

const getFloatingStyleFromPos = (pos:ModlogiePos):React.CSSProperties => {
  const style:Partial<CSSStyleDeclaration> = { }
  applyFloatingStyleFromPos(style, pos)
  return style
}

const applyContainerStyleFromPos = (style:Partial<CSSStyleDeclaration>, pos:ModlogiePos) => {
  const { right, bottom } = pos
  style.left = right ? 'unset' : '0'
  style.right = right ? '0' : 'unset'
  style.bottom = `${bottom}%`
  style.alignItems = 'flex-end' // bottom < 50 ? 'flex-end' : 'flex-start'
  style.flexDirection = right ? 'row-reverse' : 'row'
}

const applyFloatingStyleFromPos = (style:Partial<CSSStyleDeclaration>, pos:ModlogiePos) => {
  const { bottom } = pos
  style.flexDirection = 'column-reverse'// bottom < 50 ? 'column-reverse' : 'column'
}

type Store = {
  destory?():void
  pos:ModlogiePos,
  menus:[string, React.ReactNode, React.ReactNode, boolean?][]
}

export default function Modlogie () {
  const [store] = useState<Store>({ menus: [], pos: initPos })
  const [hidden, setHidden] = useState(false)
  const [inited, setInited] = useState(false)
  const [fMenu, setFMenu] = useState<React.ReactNode|undefined>()
  const [bMenu, setBMenu] = useState<React.ReactNode|undefined>()
  const [opacity, setOpacity] = useState<boolean|undefined>()
  const [helpSubject, setHelpSubject] = useState<Subject|undefined>()
  const [currentPage, setCurrentPage] = useState<string|undefined>()
  const clearUp = () => {
    if (store.destory) {
      store.destory()
      store.destory = undefined
    }
  }
  const locate = useServicesLocate()
  const viewService = locate(IViewService)
  const langs = locate(ILangsService)
  const openHelp = async () => {
    if (!helpSubject || !currentPage) {
      return
    }
    locate(IViewService).prompt(`[${langs.get(Langs.Help)}]${currentPage}`, [
      { type: 'FolderOrArticle', value: `${helpSubject.path}/${currentPage}` }
    ])
  }
  viewService.setShowFloatingMenu = (show?:boolean) => { setHidden(!show); return !hidden }
  viewService.setFloatingMenus = (key:string, bmenus?:React.ReactNode, fmenus?:React.ReactNode, opacity?:boolean) => {
    store.menus = store.menus.filter(([k]) => k !== key)
    if (fmenus || bmenus) {
      store.menus.unshift([key, bmenus, fmenus, opacity])
      const currentPage = langs.get(key)
      if (helpSubject && helpSubject.children && helpSubject.children.length) {
        const currentHelpSub = helpSubject.children.find(s => s.name === currentPage)
        setCurrentPage(currentHelpSub?.name)
      }
    }
    setBMenu(store.menus[0]?.[1])
    setFMenu(store.menus[0]?.[2])
    setOpacity(store.menus[0]?.[3])
  }
  const configService = locate(IUserConfigsService)
  useEffect(() => {
    const loadConfigs = async () => {
      const pos = await configService.getOrDefault(LastModlogiePosKey, defaultPos)
      pos.bottom = Math.min(90, Math.max(pos.bottom, 0))
      const root = await locate(IConfigsService).getValueOrDefault(ConfigKeys.DOCS_PATH)
      const subject = await locate(ISubjectsService).getByPath(root)
      store.pos = pos
      setHelpSubject(subject)
      setInited(true)
    }
    loadConfigs()
    return clearUp
  }, [])

  const containerStyle = getContainerStyleFromPos(store.pos)
  const floatingStyle = getFloatingStyleFromPos(store.pos)
  const [open, setOpen] = useState(false)

  return <div className={classNames('modlogie-wraper', open ? 'open' : '')} onClick={() => setOpen(false)}>
    <div className={classNames('modlogie', !inited || hidden ? 'hidden' : '')} style={containerStyle}>
      <div className={classNames('floating-menus', opacity ? 'opacity' : '')} style={floatingStyle}>
        <div onClick={(ev) => {
          ev.stopPropagation()
          setOpen(!open)
        }} className="modlogie-dot" ref={(dot) => {
          if (!dot) {
            clearUp()
            return
          }
          const div = dot.parentElement!.parentElement!
          let init:DragPosition = [0, 0]
          let current:DragPosition = [0, 0]
          let left = ''
          let bottom = ''
          const transition = `1s cubic-bezier(0.175, 0.885, 0.32, 1.275) left,
          1s cubic-bezier(0.175, 0.885, 0.32, 1.275) right,
          1s cubic-bezier(0.175, 0.885, 0.32, 1.275) bottom`
          const start = (pos:DragPosition) => {
            init = pos
            const style = getComputedStyle(div)
            left = style.left
            bottom = style.bottom
            div.style.transition = ''
          }
          const moving = (pos:DragPosition) => {
            current = pos
            const styleLeft = parseFloat(left) + current[0] - init[0]
            const styleBottom = parseFloat(bottom) + init[1] - current[1]
            div.style.left = `${styleLeft}px`
            div.style.right = 'unset'
            div.style.bottom = `${styleBottom}px`
          }
          const end = () => {
            const style = getComputedStyle(div)
            const iBottom = parseInt(style.bottom) * 100 / window.innerHeight
            let right = false
            const bottom = iBottom
            if ((store.pos.right && (parseInt(style.right) < window.innerWidth / 2)) ||
        (!store.pos.right && (parseInt(style.left) > window.innerWidth / 2))) {
              right = true
            }

            const pos = { right, bottom }
            const delay = 20
            const updatePos = () => {
              configService.set(LastModlogiePosKey, pos)
              store.pos = pos
              div.style.transition = transition
              applyContainerStyleFromPos(div.style, pos)
              applyFloatingStyleFromPos(dot.parentElement!.style, pos)
            }
            if (!pos.right) {
              setTimeout(updatePos, delay)
              return
            }
            if (pos.right) {
              div.style.right = getComputedStyle(div).right
              div.style.left = 'unset'
              setTimeout(updatePos, delay)
            }
          }
          store.destory = registerDragMove(document, dot, start, moving, end)
        }}>
          <Button size="large" type="primary"
            shape="circle" icon={<DragOutlined /> } ></Button>
        </div>
        {open && currentPage ? <Button size="large" type="primary" onClick={openHelp}
          shape="circle" icon={<QuestionOutlined /> } ></Button> : undefined}
        {open ? bMenu : fMenu}
      </div>

      {open ? <div onClick={(ev) => ev.stopPropagation()} > <ModlogieView onClose={() => setOpen(false)}></ModlogieView> </div> : undefined}
    </div>
  </div>
}
