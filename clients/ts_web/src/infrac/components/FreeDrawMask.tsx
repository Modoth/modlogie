import './FreeDrawMask.less'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

type PropsType = { enabled: boolean, version: number, explicit: boolean, penOnly?: boolean, onPenFound?: () => boolean, size: number, pen: [string, number], earse: boolean, hidden: boolean }
let p: PropsType = {} as any
const clearCanvas = (c:HTMLCanvasElement) => {
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, c.width, c.height)
}
export default function FreeDrawMask (props: PropsType) {
  const ref = React.createRef<HTMLCanvasElement>()
  const tmpRef = React.createRef<HTMLCanvasElement>()
  p = props
  const delay = 10
  const minDist = 1
  const [existedPen, setExistedPen] = useState(false)
  const [store] = useState({ needUpdateScale: false })
  useEffect(() => {
    ref.current && clearCanvas(ref.current)
    tmpRef.current && clearCanvas(tmpRef.current)
    store.needUpdateScale = true
  }, [props.version])
  useEffect(() => {
    const canvas = ref.current!
    const style = getComputedStyle(canvas)
    const tmpCanvas = tmpRef.current!
    let scale = 1; let tempScale = 1
    const updateScale = () => {
      clearCanvas(tmpCanvas)
      clearCanvas(canvas)
      const height = parseFloat(style.height)
      const width = parseFloat(style.width)
      const maxSize = 2 ** 15
      let maxScale = Math.min(maxSize / width, maxSize / height)
      maxScale = Math.max(Math.floor(maxScale * 10) / 10, 1)
      maxScale = height < 2.5 * window.innerHeight ? maxScale : 1
      scale = Math.min(window.devicePixelRatio || 1, maxScale)
      tempScale = scale
      tmpCanvas.height = height * tempScale
      tmpCanvas.width = width * tempScale
      canvas.height = height * scale
      canvas.width = width * scale
      store.needUpdateScale = false
    }
    const getPos = (ev: MouseEvent | TouchEvent): [[number, number], [number, number]] => {
      const rec = tmpCanvas.getClientRects()
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
    const isNotPen = (ev: MouseEvent | TouchEvent) => (ev as TouchEvent).touches?.[0]?.['touchType'] !== 'stylus'
    const startDraw = (ev: MouseEvent | TouchEvent) => {
      if (!p.enabled) {
        return
      }
      if (!p.explicit) {
        if (isNotPen(ev)) {
          return
        }
        if (!props.onPenFound?.()) {
          return
        }
      }
      if (p.penOnly && isNotPen(ev)) { return }
      if (!existedPen) {
        if (!isNotPen(ev)) {
          setExistedPen(true)
          p.onPenFound?.()
        }
      }
      drawing = true
      if (store.needUpdateScale) {
        updateScale()
      }
      let t: [number, number]
      [[x, y], t] = getPos(ev)
      lastPath = [t]
      lastPos = undefined
      lastMoveTime = 0
    }
    const drawLastPath = () => {
      const paths = lastPath
      if (paths.length < 3) {
        return
      }

      const ctx = canvas.getContext('2d')!
      ctx.save()
      ctx.lineCap = 'round'
      ctx.strokeStyle = p.pen[0]
      ctx.lineWidth = p.size * scale * (p.pen[1] || 1)
      ctx.beginPath()
      ctx.moveTo(...paths[0])
      let i = 1
      for (i = 1; i < paths.length - 2; i++) {
        const p1 = paths[i]
        const p2 = paths[i + 1]
        ctx.quadraticCurveTo(p1[0], p1[1], (p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
      }
      ctx.quadraticCurveTo(paths[i][0], paths[i][1], paths[i + 1][0], paths[i + 1][1])
      ctx.stroke()
      ctx.closePath()
      ctx.restore()
    }
    const stopDraw = (ev: MouseEvent | TouchEvent) => {
      if (!drawing) { return }
      if (props.penOnly && isNotPen(ev)) { return }
      drawing = false
      if (p.earse) {
        return
      }
      requestAnimationFrame(() => {
        clearCanvas(tmpCanvas)
        drawLastPath()
      })
    }
    const drawInAnimationFrame = (s: [number, number], t: [number, number]) => {
      // if (Date.now() - lastMoveTime <= delay) {
      //   return
      // }
      let [tx, ty] = s
      if (Math.hypot(tx - x, ty - y) < minDist) {
        return
      }
      if (p.earse) {
        [tx, ty] = t
        const ctx = canvas.getContext('2d')!
        ctx.save()
        ctx.lineCap = 'round'
        const r = p.size * scale * (p.pen[1] || 1) / 2
        ctx.clearRect(Math.min(x, tx) - r, Math.min(y, ty) - r, Math.abs(x - tx) + 2 * r, Math.abs(y - ty) + 2 * r)
        ctx.restore()
      } else {
        const [tx, ty] = s
        if (Math.hypot(tx - x, ty - y) < minDist) {
          return
        }
        const ctx = tmpCanvas.getContext('2d')!
        ctx.save()
        ctx.lineCap = 'round'
        ctx.strokeStyle = p.pen[0]
        ctx.lineWidth = p.size * tempScale * (p.pen[1] || 1)
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
    <canvas ref={ref} className={classNames('free-draw', props.explicit ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
    <canvas ref={tmpRef} className={classNames('free-draw', props.explicit ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
  </>
}
