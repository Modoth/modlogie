import './FreeDrawMask.less'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

let p = {} as any
export default function FreeDrawMask(props: { enabled: boolean, penOnly?: boolean, onPenFound?: () => void, size: number, color: string, earse: boolean, hidden: boolean }) {
  const ref = React.createRef<HTMLCanvasElement>()
  const tmpRef = React.createRef<HTMLCanvasElement>()
  p = props
  const delay = 10
  const minDist = 1
  const [existedPen, setExistedPen] = useState(false)
  useEffect(() => {
    const canvas = ref.current!
    const style = getComputedStyle(canvas)
    const tmpCanvas = tmpRef.current!
    tmpCanvas.height = parseFloat(style.height)
    tmpCanvas.width = parseFloat(style.width)
    const maxSize = 2 ** 15
    let maxScale = Math.min(maxSize / tmpCanvas.width, maxSize / tmpCanvas.height)
    maxScale = Math.max(Math.floor(maxScale * 10) / 10, 1)
    maxScale = tmpCanvas.height < 2.5 * window.innerHeight ? maxScale : 1
    const scale = Math.min(window.devicePixelRatio || 1, maxScale)
    canvas.height = tmpCanvas.height * scale
    canvas.width = tmpCanvas.width * scale
    const getPos = (ev: MouseEvent | TouchEvent): [[number, number], [number, number]] => {
      const rec = canvas.getClientRects()
      let x: number
      let y: number
      if (ev instanceof MouseEvent) {
        [x, y] = [ev.x - rec[0].x, ev.y - rec[0].y]
      } else {
        const e = ev.touches[0];
        [x, y] = [e.clientX - rec[0].x, e.clientY - rec[0].y]
      }
      const sx = tmpCanvas.width / parseFloat(style.width)
      const sy = tmpCanvas.height / parseFloat(style.height)
      const tx = canvas.width / parseFloat(style.width)
      const ty = canvas.height / parseFloat(style.height)
      return [[x * sx, y * sy], [x * tx, y * ty]]
    }
    let drawing = false
    let x = 0
    let y = 0
    let lastPos: [number, number] | undefined
    let lastMoveTime = 0
    let lastPath: [number, number][] = []
    const isNotPen = (ev: MouseEvent | TouchEvent) => (ev as TouchEvent).touches?.[0]?.["touchType"] !== "stylus"
    const startDraw = (ev: MouseEvent | TouchEvent) => {
      if (!p.enabled) {
        return
      }
      if (p.penOnly && isNotPen(ev)) { return }
      if (!existedPen) {
        if (!isNotPen(ev)) {
          setExistedPen(true)
          p.onPenFound?.()
        }
      }
      drawing = true;
      let t: [number, number]
      [[x, y], t] = getPos(ev)
      lastPath = [t];
      lastPos = undefined
      lastMoveTime = 0
    }
    const drawLastPath = () => {
      let paths = lastPath
      if (paths.length < 3) {
        return
      }
      const ctx = canvas.getContext('2d')!
      ctx.save()
      ctx.lineCap = 'round'
      ctx.strokeStyle = p.color
      ctx.lineWidth = p.size * scale
      ctx.beginPath()
      ctx.moveTo(...paths[0])
      ctx.moveTo(...paths[0]);
      let i = 1
      for (i = 1; i < paths.length - 2; i++) {
        let p1 = paths[i]
        let p2 = paths[i + 1]
        ctx.quadraticCurveTo(p1[0], p1[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2);
      }
      ctx.quadraticCurveTo(paths[i][0], paths[i][1], paths[i + 1][0], paths[i + 1][1]);
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
    const stopDraw = (ev: MouseEvent | TouchEvent) => {
      if (props.penOnly && isNotPen(ev)) { return }
      drawing = false
      if (p.earse) {
        return
      }
      requestAnimationFrame(() => {
        const ctx = tmpCanvas.getContext('2d')!
        ctx.clearRect(0, 0, tmpCanvas.width, tmpCanvas.height)
        drawLastPath()
      })
    }
    const drawInAnimationFrame = (s: [number, number], t: [number, number]) => {
      // if (Date.now() - lastMoveTime <= delay) {
      //   return
      // }
      const [tx, ty] = s
      if (Math.hypot(tx - x, ty - y) < minDist) {
        return
      }
      if (p.earse) {
        const ctx = canvas.getContext('2d')!
        ctx.save()
        ctx.lineCap = 'round'
        ctx.clearRect(Math.min(x, tx) - p.size, Math.min(y, ty) - p.size, Math.abs(x - tx) + p.size, Math.abs(y - ty) + p.size)
        ctx.restore()
      } else {
        const ctx = tmpCanvas.getContext('2d')!
        ctx.save()
        ctx.lineCap = 'round'
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(tx, ty)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
        lastPath.push(t)
      }

      lastPos = [x, y]
      x = tx
      y = ty
      lastMoveTime = Date.now()
    }

    const draw = (ev: MouseEvent | TouchEvent) => {
      if (props.penOnly && isNotPen(ev)) { return }
      if (!drawing) {
        return
      }
      if (window.TouchEvent && ev instanceof window.TouchEvent && ev.touches.length > 1) {
        return
      }
      ev.stopPropagation()
      ev.preventDefault()
      const [s, t] = getPos(ev)
      requestAnimationFrame(() => drawInAnimationFrame(s, t))
    }
    canvas.parentElement!.onmousedown = startDraw
    canvas.parentElement!.ontouchstart = startDraw
    canvas.parentElement!.onmousemove = draw
    canvas.parentElement!.ontouchmove = draw
    canvas.parentElement!.onmouseup = stopDraw
    canvas.parentElement!.ontouchend = stopDraw
    canvas.parentElement!.onmouseleave = stopDraw
    canvas.parentElement!.ontouchend = stopDraw
  }, [])
  return <>
    <canvas ref={ref} className={classNames('free-draw', props.enabled ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
    <canvas ref={tmpRef} className={classNames('free-draw', props.enabled ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
  </>
}
