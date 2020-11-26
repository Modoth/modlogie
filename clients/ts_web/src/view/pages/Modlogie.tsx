import './Modlogie.less'
import { Button } from 'antd'
import { DragOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'
import ModlogieView from './ModlogieView'
import React, { useEffect, useState } from 'react'
import registerDragMove, { DragPosition } from '../../infrac/Web/registerDragMove'
import classNames from 'classnames'

const LastModlogiePosKey = 'LastModlogiePosKey'

const transition = '1s cubic-bezier(0.175, 0.885, 0.32, 1.275) left,1s cubic-bezier(0.175, 0.885, 0.32, 1.275) right'

type ModlogiePos = {right:boolean, bottom:number}

const getLastModlogiePos = ():ModlogiePos => {
  const defaultPos = { right: false, bottom: 50 }
  try {
    const str = localStorage.getItem(LastModlogiePosKey) || ''
    const pos = JSON.parse(str)
    let bottom = parseFloat(pos.bottom)
    if (isNaN(bottom)) {
      bottom = defaultPos.bottom
    }
    return { right: pos.right || defaultPos.right, bottom }
  } catch (e) {
    console.log(e)
  }
  return defaultPos
}

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
  style.bottom = `${Math.min(90, Math.max(bottom, 0))}%`
  style.alignItems = bottom < 50 ? 'flex-end' : 'flex-start'
  style.flexDirection = right ? 'row-reverse' : 'row'
}

const applyFloatingStyleFromPos = (style:Partial<CSSStyleDeclaration>, pos:ModlogiePos) => {
  const { bottom } = pos
  style.flexDirection = 'column-reverse'// bottom < 50 ? 'column-reverse' : 'column'
}

const setLastModlogiePos = (pos : ModlogiePos) => {
  localStorage.setItem(LastModlogiePosKey, JSON.stringify(pos))
}

type Store = {
  destory?():void
  pos:ModlogiePos,
  menus:[string, React.ReactNode, boolean?][]
}

export default function Modlogie () {
  const [store] = useState<Store>({ pos: getLastModlogiePos(), menus: [] })
  const [hidden, setHidden] = useState(false)
  const [floatingMenus, setFloatingMenus] = useState<React.ReactNode|undefined>()
  const [opacity, setOpacity] = useState<boolean|undefined>()
  const clearUp = () => {
    if (store.destory) {
      store.destory()
      store.destory = undefined
    }
  }
  const viewService = useServicesLocator().locate(IViewService)
  viewService.setShowFloatingMenu = (show?:boolean) => { setHidden(!show); return !hidden }
  viewService.setFloatingMenus = (key:string, menus?:React.ReactNode, opacity?:boolean) => {
    store.menus = store.menus.filter(([k]) => k !== key)
    if (menus) {
      store.menus.unshift([key, menus, opacity])
    }
    setFloatingMenus(store.menus[0]?.[1])
    setOpacity(store.menus[0]?.[2])
  }
  const containerStyle = getContainerStyleFromPos(store.pos)
  const floatingStyle = getFloatingStyleFromPos(store.pos)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    return clearUp
  }, [])
  return <div className={classNames('modlogie-wraper', open ? 'open' : '')} onClick={() => setOpen(false)}>
    <div onClick={(ev) => ev.stopPropagation()} className={classNames('modlogie', hidden ? 'hidden' : '')} style={containerStyle}>
      <div className={classNames('floating-menus', opacity ? 'opacity' : '')} style={floatingStyle}>
        <div onClick={() => setOpen(!open)} className="modlogie-dot" ref={(dot) => {
          if (!dot) {
            clearUp()
            return
          }
          const div = dot.parentElement!.parentElement!
          let init:DragPosition = [0, 0]
          let current:DragPosition = [0, 0]
          let left = ''
          let bottom = ''
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
              setLastModlogiePos(pos)
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
        {open ? undefined : floatingMenus}
      </div>

      <div className={open ? '' : 'hidden'}><ModlogieView ></ModlogieView></div>
    </div>
  </div>
}
