import './MarkdownViewer.less'
import { getSimpleStringHash } from '../../../view/pages/common'
import { NavigationSection } from '../../../pluginbase/IPluginInfo'
import { useMagicMask, useMagicSeed, useServicesLocate, useWikiLevel } from '../../../view/common/Contexts'
import classNames from 'classnames'
import HighlightLive from '../../../view/pages/HighlightLive'
import LocatableView from '../../../infrac/components/LocatableView'
import Markdown from '../../../infrac/components/Markdown'
import React, { useEffect, useState } from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'
import IWikiService from '../../../domain/ServiceInterfaces/IWikiService'

function WikiLink (props: { href: string, target: string, children:any}) {
  const curWikiLevel = useWikiLevel()
  const locate = useServicesLocate()
  const [normal, setNormal] = useState(false)
  useEffect(() => {
    (async () => {
      setNormal(false)
      if (curWikiLevel <= 0 || !props.href) { setNormal(true); return }
      const match = props.href.match(/^(\w*?):(.*)$/)
      if (!match) { setNormal(true); return }
      const group = match[1]
      if (!group) {
        setNormal(true)
        return
      }
      const proto = group.toLocaleLowerCase()
      if (proto === 'http' || proto === 'https' || proto === 'article') {
        setNormal(true)
        return
      }
      const name = decodeURIComponent(match[2]) || props.children[0]?.props?.value
      if (!name) { setNormal(true); return }
      console.log(group, name)
      const wikiLevels = await locate(IWikiService).getWeights(group)
      const level = wikiLevels.get(name)
      if (level !== undefined && level >= curWikiLevel) {
        setNormal(true)
      }
    })()
  }, [curWikiLevel])
  if (normal) {
    return <a href={props.href} target={props.target}>{props.children}</a>
  }
  return <>{props.children}</>
}

const getText = (children: [React.ReactElement] | string): string => {
  if (children == null) {
    return ''
  }
  if (typeof (children) === 'string') {
    return children
  }
  if (!children.length) {
    return ''
  }
  return (children as [React.ReactElement]).map(c => c.props?.children ? getText(c.props?.children) : '').join('')
}

const getSimpleHash = (children:any, seed:number) => {
  const s : string = getText(children)
  return getSimpleStringHash(s, seed)
}

const getRenders = (root: NavigationSection | undefined, magicMask: number, magicSeed: number) => {
  const renders: any = {
    code: HighlightLive
  }
  const contentBase = (window.ENV_OVERRIDE || window.ENV || {}).CONTENT_BASE || ''
  // eslint-disable-next-line react/display-name
  renders.image = (props: { alt: string, src: string }) => {
    const url = contentBase + props.src
    return <ImageViewer alt={props.alt} src={url}></ImageViewer>
  }

  renders.link = WikiLink

  // eslint-disable-next-line react/display-name
  renders.strong = (props: any) => {
    const maxLevel = 2
    if (magicMask === maxLevel || (magicMask >= 1 && (getSimpleHash(props.children, magicSeed) + magicSeed) % maxLevel < magicMask)) {
      return <span className="mask-word">{props.children}</span>
    }
    return <>{props.children}</>
  }

  if (!root) {
    return renders
  }
  root.children = []

  // eslint-disable-next-line react/display-name
  renders.heading = ({ level, children }: { level: number, children: [React.ReactElement] }) => {
    const s = new NavigationSection(getText(children), level)
    root.children.push(s)
    return <LocatableView callbacks={s} View={() => React.createElement(`h${level}`, null, ...children)}></LocatableView>
  }
  return renders
}

function ImageViewer (props: React.ImgHTMLAttributes<HTMLImageElement>) {
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
  return <>
    <span className="embed-img" ><img alt={props.alt} src={props.src} onClick={toggleFullscreen} /></span>
    <div onClick={toggleFullscreen} className={classNames('full-img', fullscreen ? '' : 'hidden')}>
      <img ref={imgRef}
        style={{ width: `${scale}%`, maxWidth: `${scale}%`, maxHeight: `${100}%` }} alt={props.alt} src={props.src} />
    </div>
  </>
}

export default function MarkdownViewer (props: SectionViewerProps) {
  const magicMask = useMagicMask()
  const magicSeed = useMagicSeed()
  const renderers = getRenders(props.navigationRoot, magicMask, magicSeed) as any
  return <div onClick={(e) => {
    if ((e.target as any)?.nodeName === 'A') {
      return
    }
    if (props.onClick) {
      props.onClick(e)
    }
  }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}>
    <label className="md-name">{props.section.name}</label>
    <Markdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></Markdown>
  </div>
}
