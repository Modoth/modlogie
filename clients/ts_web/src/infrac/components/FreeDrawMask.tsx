import './FreeDrawMask.less'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

let p = {} as any
export default function FreeDrawMask (props: { enabled: boolean, penOnly?:boolean, onPenFound?:()=>void, size: number, color: string, earse: boolean, hidden: boolean }) {
  const ref = React.createRef<HTMLCanvasElement>()
  p = props
  const scale = Math.min(window.devicePixelRatio || 1, 1)
  const delay = 10
  const minDist = 1
  const [existedPen, setExistedPen] = useState(false)
  useEffect(() => {
    const canvas = ref.current!
    const style = getComputedStyle(canvas)
    canvas.height = parseFloat(style.height) * scale
    canvas.width = parseFloat(style.width) * scale
    const getPos = (ev: MouseEvent | TouchEvent): [number, number] => {
      const rec = canvas.getClientRects()
      let x:number
      let y:number
      if (ev instanceof MouseEvent) {
        [x, y] = [ev.x - rec[0].x, ev.y - rec[0].y]
      } else {
        const e = ev.touches[0];
        [x, y] = [e.clientX - rec[0].x, e.clientY - rec[0].y]
      }
      const sx = canvas.width / parseFloat(style.width)
      const sy = canvas.height / parseFloat(style.height)
      return [x * sx, y * sy]
    }
    let drawing = false
    let x = 0
    let y = 0
    let lastPos:[number, number]|undefined
    let lastMoveTime = 0
    const isNotPen = (ev: MouseEvent | TouchEvent) => (ev as TouchEvent).touches?.[0]?.["touchType"]!=="stylus"
    const startDraw = (ev: MouseEvent | TouchEvent) => {
      if(p.penOnly && isNotPen(ev)) { return }
      if(!existedPen){
        if(!isNotPen(ev)){
          setExistedPen(true)
          p.onPenFound?.()
        }
      }
      drawing = true;
      [x, y] = getPos(ev)
      lastPos = undefined
      lastMoveTime = 0
    }
    const stopDraw = (ev: MouseEvent | TouchEvent) => {
      if(props.penOnly && isNotPen(ev)) { return }
      drawing = false
    }
    const draw = (ev: MouseEvent | TouchEvent) => {
      if(props.penOnly && isNotPen(ev)) { return }
      if (!drawing) {
        return
      }
      if (window.TouchEvent && ev instanceof window.TouchEvent && ev.touches.length > 1) {
        return
      }
      ev.stopPropagation()
      ev.preventDefault()
      if (Date.now() - lastMoveTime <= delay) {
        return
      }

      const [tx, ty] = getPos(ev)
      if (Math.hypot(tx - x, ty - y) < scale * minDist) {
        return
      }
      const ctx = canvas.getContext('2d')!
      ctx.save()
      ctx.lineCap = 'round'
      if (p.earse) {
        ctx.clearRect(Math.min(x, tx) - p.size, Math.min(y, ty) - p.size, Math.abs(x - tx) + p.size, Math.abs(y - ty) + p.size)
      } else {
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        ctx.closePath()
      }

      lastPos = [x, y]
      x = tx
      y = ty
      ctx.restore()
      lastMoveTime = Date.now()
    }
    canvas.onmousedown = startDraw
    canvas.ontouchstart = startDraw
    canvas.onmousemove = draw
    canvas.ontouchmove = draw
    canvas.onmouseup = stopDraw
    canvas.ontouchend = stopDraw
    canvas.onmouseleave = stopDraw
    canvas.ontouchend = stopDraw
  }, [])
  return <canvas ref={ref} className={classNames('free-draw', props.enabled ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
}
