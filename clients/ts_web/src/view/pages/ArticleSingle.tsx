import './ArticleSingle.less'
import { ArticleContentType, ArticleContentViewerCallbacks, NavigationSection } from '../../pluginbase/IPluginInfo'
import { BarsOutlined, EditOutlined, ClearOutlined, PrinterOutlined, HighlightOutlined, CloseOutlined, ArrowLeftOutlined, FontSizeOutlined, BgColorsOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { CaptureWordIcon, EraserIcon, ScreenshotIcon } from '../common/Icons'
import { DisableClozeHoverProvider, LocatableOffsetProvider, useServicesLocate } from '../common/Contexts'
import Article from '../../domain/ServiceInterfaces/Article'
import CaptureDict from './CaptureDict'
import classNames from 'classnames'
import FreeDrawMask from '../../infrac/components/FreeDrawMask'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'
import IViewService from '../../app/Interfaces/IViewService'
import LocatableView, { Div, LocatableViewCallbacks } from '../../infrac/components/LocatableView'
import React, { useEffect, useState } from 'react'

const themeCount = 2
const getThemeClass = (idx: number) => idx >= 0 ? `reading-theme reading-theme-${idx}` : ''
const ThemeKey = 'READING_THEME'
const EmbedSourceKey = 'SOURCE_STYLE'
const CaptureDictKey = 'CAPTUR_DICT'
const drawSizes = [1, 1.5, 5]
const drawPens: [string, number, string | null][] = [
  ['#ffff0040', 12, '#ffff00'],
  ['#4169E1', 1, null],
  ['#ff0000', 1, null],
  ['#2d2d2d', 1, null]
]
const highlightableClasses = ['no-hover-cloze', 'cloze', 'mdg']
const findHighlightableElement = (from: HTMLElement | null, to: HTMLElement | null): HTMLElement | undefined => {
  if (!from || !to) {
    return undefined
  }
  let cur: HTMLElement | null = from
  while (cur && cur !== to) {
    if (highlightableClasses.find(c => cur?.classList.contains(c))) {
      return cur
    }

    if (cur.tagName === 'A') {
      return undefined
    }
    cur = cur.parentElement
  }
}
export default function ArticleSingle (props: { article: Article, type: ArticleContentType }) {
  const locate = useServicesLocate()
  const [sections, setSections] = useState<NavigationSection[]>([])
  const [hasSource, setHasSource] = useState(false)
  const [currentSection, setCurrentSection] = useState<NavigationSection | undefined>(undefined)
  const [drawSize, setDrawSize] = useState(drawSizes[1])
  const [drawPen, setDrawPen] = useState(drawPens[0])
  const [earse, setEarse] = useState(false)
  const viewService = locate(IViewService)
  const [store] = useState({} as { highlightable?: HTMLElement })
  const close = () => {
    viewService.previewArticle()
  }
  const [statusText, setStatusText] = useState('')
  const langs = locate(ILangsService)
  const [freeDraw, setFreeDraw] = useState(false)
  const [drawVersion, setDrawVersion] = useState(0)
  const [penOnly, setPenOnly] = useState(false)
  const [existedPen, setExistedPen] = useState(false)
  const [sidePopup, setSidePopup] = useState(false)
  const [captureDict, setCaptureDict] = useState(false)
  const [embedSrc, setEmbedSrc] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(0)
  const ref = React.createRef<HTMLDivElement>()
  const [callbacks] = useState({} as ArticleContentViewerCallbacks)
  const [locateRef] = useState({} as LocatableViewCallbacks)
  const scrollToTop = (direct?: boolean) => {
    if (locateRef && locateRef.locate) {
      locateRef.locate(direct, 50)
    }
  }
  callbacks.onSections = (secs) => {
    setHasSource(!!secs.find(s => s.name?.endsWith(langs.get(LangKeys.TranslateSectionSurfix))))
    setSections(secs)
  }
  const configsService = locate(IUserConfigsService)
  useEffect(() => {
    if (!sidePopup) {
      viewService.setFloatingMenus?.(LangKeys.PageArticleSingle,
        <>
          { freeDraw ? undefined : <Button type="primary" shape="circle" size="large" icon={<PrinterOutlined />} onClick={() => window.print()} />
          }
          <Button key="screen-shot" type="primary" shape="circle" size="large" icon={<ScreenshotIcon />} onClick={() => {
            scrollToTop(true)
            setTimeout(() => viewService.captureElement(ref.current!), 50)
          }} ></Button>
          <Button key="capture-dict" type={captureDict ? 'primary' : 'default'} shape="circle" size="large" danger={captureDict} icon={<CaptureWordIcon />} onClick={() => {
            setCaptureDict(!captureDict)
            configsService.set(CaptureDictKey, !captureDict)
          }}></Button>
          {
            freeDraw ? undefined : <>
              {hasSource ? <Button key="embed-src" type={embedSrc ? 'primary' : 'default'} shape="circle" size="large" danger={embedSrc} onClick={() => {
                setHightlight(undefined)
                setEmbedSrc(!embedSrc)
                configsService.set(EmbedSourceKey, !embedSrc)
              }}>{<span className="embed-src">中<span>En</span></span>}</Button> : undefined}
              {/* <Button key="theme" type="primary" shape="circle" size="large" icon={<FontSizeOutlined />}
                onClick={() => {
                  const nextTheme = (currentTheme + 1) % themeCount
                  setCurrentTheme(nextTheme)
                  configsService.set(ThemeKey, nextTheme)
                }
                }
              ></Button> */}
            </>
          }
        </>,
        <Button className="catelog-btn" icon={<BarsOutlined />} type="primary"
          size="large"
          shape="circle" onClick={() => setSidePopup(true)}>
        </Button>)
      viewService.setShowFloatingMenu?.(true)
    } else {
      viewService.setFloatingMenus?.(LangKeys.PageArticleSingle)
      viewService.setShowFloatingMenu?.(false)
    }
  })
  useEffect(() => {
    const loadConfigs = async () => {
      const captureDict = await configsService.getOrDefault(CaptureDictKey, false)
      setCaptureDict(captureDict)
      const currentTheme = await configsService.getOrDefault(ThemeKey, 0)
      setCurrentTheme(currentTheme)
      const embedSrc = await configsService.getOrDefault(EmbedSourceKey, false)
      setEmbedSrc(embedSrc)
    }
    loadConfigs()
    return () => {
      viewService.setFloatingMenus?.(LangKeys.PageArticleSingle)
      viewService.setShowFloatingMenu?.(true)
    }
  }, [])
  const maxNavigationLevel = 2
  const NavigationSectionView = (section: NavigationSection): React.ReactElement | undefined => {
    if (section.level > maxNavigationLevel) {
      return undefined
    }
    section.onLocated = () => setCurrentSection(section)
    return <>
      <div key={section + 'menu'} className={`item item-${section.level} ${section === currentSection ? 'current-item' : ''}`} onClick={() => {
        setSidePopup(false)
        setHightlight()
        section.locate?.()
        setCurrentSection(section)
      }}>
        <span><span className="item-indent">{'  '.repeat(section.level) + '- '}</span>{section.name}</span>
      </div>
      { section.children && section.children.length ? section.children.map(NavigationSectionView) : undefined}
    </>
  }
  const setHightlight = (highlightable: HTMLElement | undefined = undefined) => {
    if (highlightable === store.highlightable) {
      return
    }
    if (store.highlightable) {
      store.highlightable.classList.remove('hover')
    }
    store.highlightable = highlightable
    let statusText = ''
    if (store.highlightable) {
      store.highlightable.classList.add('hover')
      if (store.highlightable.classList.contains('mdg')) {
        statusText = (store.highlightable.lastChild as any)?.innerText?.trim()
      }
    }
    setStatusText(statusText)
  }
  const onViewerClick = (ev: React.MouseEvent<any>) => {
    const highlightable = findHighlightableElement(ev.target as HTMLElement, ev.currentTarget as HTMLElement)
    if (highlightable === store.highlightable) {
      return
    }
    setHightlight(highlightable)
  }
  return (
    <LocatableOffsetProvider value={0}>
      <LocatableView View={Div} callbacks={locateRef} className={classNames('single-article', getThemeClass(currentTheme))}>
        <div className={classNames('menus', statusText ? 'status-menus' : '')}>
          <div className={classNames('menus-bar')} onClick={e => e.stopPropagation()}>
            {
              statusText ? <>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>
                <div className={classNames('status-text')}><span>{statusText}</span></div>
              </>
                : <>
                  {freeDraw ? undefined : <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>}
                  {
                    !freeDraw ? (<>
                      {props.type.noTitle ? <div className={classNames('title')}></div> : <div className={classNames('title')}>{props.article.name}</div>}
                      <Button className="single-article-content-menu-btn" type="link" size="large" icon={<HighlightOutlined />} onClick={() => setFreeDraw(true)}></Button>
                    </>) : (<>
                      <Button className="single-article-content-menu-btn single-article-content-menu-btn-draw" size="large" type={earse ? 'primary' : 'text'} icon={<EraserIcon />} onClick={() => setEarse(!earse)}></Button>
                      {drawPens.map(c => <Button key={c[0]} className="single-article-content-menu-btn single-article-content-menu-btn-draw" type={ !earse && c === drawPen ? 'primary' : 'link'} size="large" icon={<BgColorsOutlined style={{ color: c[2] || c[0] }} />} onClick={() => {
                        setDrawPen(c)
                        setEarse(false)
                      }}></Button>)}
                      {drawSizes.map(s => <Button key={s} className="single-article-content-menu-btn single-article-content-menu-btn-draw" type={s === drawSize ? 'primary' : 'link'} size="large" icon={<span className="pen-size" style={{ height: `${s}px`, background: drawPen[2] || drawPen[0] }}></span>} onClick={() => setDrawSize(s)}></Button>)}
                      {existedPen ? <Button className="single-article-content-menu-btn" type={penOnly ? 'primary' : 'link'} size="large" icon={<EditOutlined />} onClick={() => setPenOnly(!penOnly)}></Button> : undefined}
                      <div className={classNames('title')}></div>
                      <Button className="single-article-content-menu-btn" type="link" size="large" danger icon={<ClearOutlined />} onClick={() => setDrawVersion(drawVersion + 1)}></Button>
                      <Button className="single-article-content-menu-btn" type="link" size="large" danger icon={<CloseOutlined />} onClick={() => { setDrawVersion(drawVersion + 1); setFreeDraw(false) }}></Button>
                    </>)
                  }
                </>
            }
          </div>
        </div>
        <div className={classNames('side', sidePopup ? 'show-pop pop-up-wraper' : '')} onClick={() => {
          sidePopup && setSidePopup(false)
        }}>
          <div className="catelog pop-up" onClick={ev => ev.stopPropagation()}>
            {/* <div className="top" onClick={() => {
              setSidePopup(false)
              scrollToTop()
            }}><span>{langs.get(LangKeys.Top)}</span></div> */}
            {
              sections.map(NavigationSectionView)
            }
          </div>
        </div>
        <div ref={ref} className={classNames('article')}>
          <div className={classNames('article-content', embedSrc ? 'embed-src' : '')} onClick={embedSrc ? undefined : onViewerClick} spellCheck="false" >
            <DisableClozeHoverProvider value={freeDraw}>
              <props.type.Viewer articleId={props.article.id!} published={props.article.published} viewerCallbacks={callbacks} showAdditionals={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
            </DisableClozeHoverProvider>
          </div>
          <FreeDrawMask hidden={false} enabled={true} version={drawVersion} penOnly={penOnly} onPenFound={() => { setExistedPen(true); setPenOnly(true); setFreeDraw(true); return true }} earse={earse} size={drawSize} pen={drawPen as any} explicit={freeDraw}></FreeDrawMask>
          {
            captureDict
              ? <CaptureDict offset={-50}></CaptureDict>
              : undefined}
        </div>
      </LocatableView>
    </LocatableOffsetProvider>
  )
}
