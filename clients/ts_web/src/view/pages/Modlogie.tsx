import './Modlogie.less'
import ModlogieView from './ModlogieView'
import React, { useEffect, useState } from 'react'
import registerDragMove, { DragPosition } from '../../infrac/Web/registerDragMove'

type Store = {
    destory?():void
    pos:ModlogiePos
}

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

const getStyleFromPos = (pos:ModlogiePos):React.CSSProperties => {
  const style:Partial<CSSStyleDeclaration> = { }
  applyStyleFromPos(style, pos)
  return style
}

const applyStyleFromPos = (style:Partial<CSSStyleDeclaration>, pos:ModlogiePos) => {
  const { right, bottom } = pos
  style.left = right ? 'unset' : '0'
  style.right = right ? '0' : 'unset'
  style.bottom = `${Math.min(90, Math.max(bottom, 0))}%`
  style.flexDirection = right ? 'row-reverse' : 'row'
}

const setLastModlogiePos = (pos : ModlogiePos) => {
  localStorage.setItem(LastModlogiePosKey, JSON.stringify(pos))
}
export default function Modlogie () {
  const [store] = useState<Store>({ pos: getLastModlogiePos() })
  const clearUp = () => {
    if (store.destory) {
      store.destory()
      store.destory = undefined
    }
  }
  const lastStyle = getStyleFromPos(store.pos)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    return clearUp
  }, [])
  return <div className="modlogie" style={lastStyle}>
    <div onClick={() => setOpen(!open)} className="modlogie-dot" ref={(dot) => {
      if (!dot) {
        clearUp()
        return
      }
      const div = dot.parentElement!
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
        if (parseInt(style.right) < parseInt(style.left)) {
          right = true
        }
        const pos = { right, bottom }
        const delay = 20
        const updatePos = () => {
          setLastModlogiePos(pos)
          store.pos = pos
          div.style.transition = transition
          applyStyleFromPos(div.style, pos)
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
      store.destory = registerDragMove(document, div, start, moving, end)
    }}></div>
    {open ? <ModlogieView></ModlogieView> : undefined}
  </div>
}
