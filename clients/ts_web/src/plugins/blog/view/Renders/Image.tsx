import classNames from 'classnames'
import React, { useEffect, useState } from 'react'

const getImage = (contentBase:string) =>
// eslint-disable-next-line react/display-name
  (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const maxScale = 500
    const minScale = 100
    const [fullscreen, setFullscreen] = useState(false)
    const [scale, setScale] = useState(maxScale)
    const imgRef = React.createRef<HTMLImageElement>()
    const smallScreen = true// window.matchMedia && window.matchMedia('(max-width: 780px)')?.matches
    const toggleFullscreen = smallScreen ? (ev: any) => { ev.stopPropagation(); setFullscreen(!fullscreen) } : undefined
    useEffect(() => {
      const img = imgRef.current!
      let scaling = false
      let startDist = 0
      let startScale = scale
      let lastScale = scale
      const dist = (ev: TouchEvent) => Math.hypot(
        ev.touches[0].pageX - ev.touches[1].pageX,
        ev.touches[0].pageY - ev.touches[1].pageY)

      const start = (ev: TouchEvent) => {
        if (ev.touches.length === 2 && smallScreen) {
          scaling = true
          ev.stopPropagation()
          startDist = dist(ev)
          startScale = lastScale
        }
      }
      const moveInFrame = (s: number) => {
        setScale(s)
      }
      const move = (ev: TouchEvent) => {
        if (!scaling) {
          return
        }
        ev.stopPropagation()
        const curDist = dist(ev)
        const s = curDist * startScale / startDist
        lastScale = Math.min(Math.max(minScale, s), maxScale)
        requestAnimationFrame(() => moveInFrame(s))
      }

      const end = (ev: TouchEvent) => {
        if (!scaling) {
          return
        }
        ev.stopPropagation()
        startScale = lastScale
        scaling = false
      }

      img.ontouchstart = start
      img.ontouchmove = move
      img.ontouchend = end
      img.ontouchcancel = end
    }, [])
    return <span className="embed-img" >{
        props.src?.endsWith('.svg')
          ? <>
            <img className="md-svg" alt={props.alt} src={contentBase + props.src} onClick={toggleFullscreen} />
            <img className="md-svg-4-screenshot" src={contentBase + props.src} />
          </>
          : <img alt={props.alt} src={contentBase + props.src} onClick={toggleFullscreen} />
    }
    <div onClick={toggleFullscreen} className={classNames('full-img', fullscreen ? '' : 'hidden')}>
      <img ref={imgRef}
        style={{ width: `${scale}%`, maxWidth: `${scale}%`, maxHeight: `${100}%` }} alt={props.alt} src={contentBase + props.src} />
    </div></span>
  }

export default getImage
