import './ArticleSingle.less'
import { ArticleContentType, ArticleContentViewerCallbacks, NavigationSection } from '../../pluginbase/IPluginInfo'
import { Button, Menu, Dropdown } from 'antd'
import { LocatableOffsetProvider, useServicesLocate } from '../common/Contexts'
import { MoreOutlined, OrderedListOutlined, FileWordOutlined,EditOutlined, FileAddOutlined, ClearOutlined, HighlightOutlined, BulbOutlined, BulbFilled, CloseOutlined, ArrowLeftOutlined, PictureOutlined, FontSizeOutlined, UnorderedListOutlined, BgColorsOutlined, ColumnHeightOutlined, ColumnWidthOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import Article from '../../domain/ServiceInterfaces/Article'
import CaptureDict from './CaptureDict'
import classNames from 'classnames'
import FreeDrawMask from '../../infrac/components/FreeDrawMask'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IUserConfigsService from '../../domain/ServiceInterfaces/IUserConfigsService'
import IViewService from '../../app/Interfaces/IViewService'
import LocatableView, { Div, LocatableViewCallbacks } from '../../infrac/components/LocatableView'
import React, { useEffect, useState } from 'react'

const themeCount = 3
const getThemeClass = (idx: number) => idx > 0 ? `reading-theme reading-theme-${idx}` : ''
const ThemeKey = 'READING_THEME'
const PaingKey = 'READING_PAIGING'
const CaptureDictKey = 'CAPTUR_DICT'
const drawSizes = [1, 5]//, 15]
const drawColors = ['#2d2d2d', '#ff0000']//, '#ffff0040']
export default function ArticleSingle (props: { article: Article, type: ArticleContentType }) {
  const locate = useServicesLocate()
  const [sections, setSections] = useState<NavigationSection[]>([])
  const [currentSection, setCurrentSection] = useState<NavigationSection | undefined>(undefined)
  const [drawSize, setDrawSize] = useState(drawSizes[0])
  const [drawColor, setDrawColors] = useState(drawColors[0])
  const [earse, setEarse] = useState(false)
  const viewService = locate(IViewService)
  const close = () => {
    viewService.previewArticle()
  }
  const langs = locate(ILangsService)
  const [freeDraw, setFreeDraw] = useState(false)
  const [expandMode, setExpandMode] = useState(false)
  const [penOnly, setPenOnly] = useState(false)
  const [existedPen, setExistedPen] = useState(false)
  const [sidePopup, setSidePopup] = useState(false)
  const [captureDict, setCaptureDict] = useState(false)
  const smallScreen = window.matchMedia && window.matchMedia('(max-width: 780px)')?.matches
  const [currentTheme, setCurrentTheme] = useState(0)
  const [paging, setPaging] = useState(false)
  const ref = React.createRef<HTMLDivElement>()
  const [callbacks] = useState({} as ArticleContentViewerCallbacks)
  const [locateRef] = useState({} as LocatableViewCallbacks)
  const prePage = () => {
    goPage(-1)
  }
  const nextPage = () => {
    goPage(1)
  }
  const goPage = (i: number) => {
    if (!ref.current || !ref.current.offsetParent) {
      return
    }
    const ele = ref.current!
    const par = ref.current.offsetParent!
    const width = ele.clientWidth
    if (!width) {
      return
    }
    const currentPage = Math.floor(par.scrollLeft / width)
    par.scroll({ left: (currentPage + i) * width, behavior: 'smooth' })
  }
  const scrollToTop = (direct?:boolean) => {
    if (locateRef && locateRef.locate) {
      locateRef.locate(direct)
    }
  }
  const jumpTo = (url:string) => {
    viewService.previewArticle(undefined, undefined, () => {
      window.location.href = url
    })
  }
  callbacks.onSections = setSections
  const configsService = locate(IUserConfigsService)
  useEffect(() => {
    if (!sidePopup) {
      viewService.setFloatingMenus?.(ArticleSingle.name, <Button className="catelog-btn" icon={<OrderedListOutlined />} type="primary"
        size="large"
        shape="circle" onClick={() => setSidePopup(true)}>
      </Button>)
      viewService.setShowFloatingMenu?.(true)
    } else {
      viewService.setFloatingMenus?.(ArticleSingle.name)
      viewService.setShowFloatingMenu?.(false)
    }
  })
  useEffect(() => {
    const loadConfigs = async () => {
      const captureDict = await configsService.getOrDefault(CaptureDictKey, false)
      setCaptureDict(captureDict)
      if (smallScreen) {
        const currentTheme = await configsService.getOrDefault(ThemeKey, 0)
        setCurrentTheme(currentTheme)
      }
    }
    loadConfigs()
    return () => {
      viewService.setFloatingMenus?.(ArticleSingle.name)
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
      <div key={section + 'menu'} className={`item item-${section.level} ${section === currentSection ? "current-item": ""}`} onClick={() => {
        setSidePopup(false)
        section.locate?.()
        setCurrentSection(section)
      }}>
        <span><span className="item-indent">{"    ".repeat(section.level) + "-  "}</span>{section.name}</span>
      </div>
      { section.children && section.children.length ? section.children.map(NavigationSectionView) : undefined}
    </>
  }
  return (
    <LocatableOffsetProvider value={0}>
      <LocatableView View={Div} callbacks={locateRef} className={classNames('single-article', getThemeClass(currentTheme), paging ? 'paging' : '')}>
        <div className={classNames('menus')}>
          <div className={classNames('menus-bar')} onClick={e => e.stopPropagation()}>
            {freeDraw ? undefined : <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>}
            {
              !freeDraw ? (<>{props.type.noTitle ? <div className={classNames('title')}></div> : <div className={classNames('title')}>{props.article.name}</div>}
                {paging ? <div className="paging-buttons">
                  <Button onClick={prePage} type="link" size="large" className="paging-button paging-button-left" icon={<LeftCircleOutlined />} ></Button>
                  <Button onClick={nextPage} type="link" size="large" className="paging-button paging-button-right" icon={<RightCircleOutlined />} ></Button>
                </div> : null}
                {
                  <Dropdown placement="bottomRight" trigger={['click']} overlay={
                    <Menu>
                      {paging ? null : ([
                        <Menu.Item key="capture"><Button className="single-article-content-menu-btn" type="link" size="large" icon={<HighlightOutlined />} onClick={() => setFreeDraw(!freeDraw)}>{langs.get(LangKeys.FreeDraw)}</Button></Menu.Item>
                      ]).concat(
                        <Menu.Divider ></Menu.Divider>,
                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={captureDict ? <BulbFilled /> : <BulbOutlined />} onClick={() => {
                          setCaptureDict(!captureDict)
                          configsService.set(CaptureDictKey, !captureDict)
                        }}>{langs.get(captureDict ? LangKeys.CaptureWordDisable : LangKeys.CaptureWordEnable)}</Button></Menu.Item>,
                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={ <FileAddOutlined />} onClick={() => jumpTo('#/manage/dicts')}>{langs.get(LangKeys.ManageDict)}</Button></Menu.Item>,
                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={ <FileWordOutlined />} onClick={() => jumpTo('#/manage/words')}>{langs.get(LangKeys.FavoriteWords)}</Button></Menu.Item>,
                        <Menu.Divider key="divider2"></Menu.Divider>,
                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={<PictureOutlined />} onClick={() => {
                          scrollToTop(true)
                          setTimeout(() => viewService.captureElement(ref.current!), 50)
                        }} >{langs.get(LangKeys.ScreenShot)}</Button></Menu.Item>
                      )
                      }
                      {smallScreen ? [<Menu.Item key="theme">
                        <Button className="single-article-content-menu-btn" type="link" size="large" icon={<BgColorsOutlined />}
                          onClick={() => {
                            const nextTheme = (currentTheme + 1) % themeCount
                            setCurrentTheme(nextTheme)
                            configsService.set(ThemeKey, nextTheme)
                          }
                          }
                        >{langs.get(LangKeys.Themes)}</Button>
                      </Menu.Item>
                        // <Menu.Item key="paging">
                        //   <Button className="single-article-content-menu-btn" type="link" size="large" icon={paging ? <ColumnHeightOutlined /> : <ColumnWidthOutlined />}
                        //     onClick={() => {
                        //       const nextPaging = !paging
                        //       setPaging(nextPaging)
                        //       savePaging(nextPaging)
                        //     }
                        //     }
                        //   >{langs.get(paging ? LangKeys.Scroll : LangKeys.Paging)}</Button>
                        // </Menu.Item>
                      ] : null}
                    </Menu>}>
                    <Button className="single-article-content-menu-btn" type="link" size="large" icon={<MoreOutlined />} onClick={(e) => e.preventDefault()} ></Button>
                  </Dropdown>
                }</>) : (<>
                  {drawSizes.map(s => <Button key={s} className="single-article-content-menu-btn single-article-content-menu-btn-draw" type={s === drawSize ? 'primary' : 'link'} size="large" icon={<span className="pen-size" style={{ height: `${s}px`, background: drawColor }}></span>} onClick={() => setDrawSize(s)}></Button>)}
                  {drawColors.map(c => <Button key={c} className="single-article-content-menu-btn single-article-content-menu-btn-draw" type={c === drawColor ? 'primary' : 'link'} size="large" icon={<BgColorsOutlined style={{ color: c }} />} onClick={() => setDrawColors(c)}></Button>)}
                  <Button className="single-article-content-menu-btn single-article-content-menu-btn-draw" size="large" type={earse ? 'primary' : 'text'} icon={<ClearOutlined />} onClick={() => setEarse(!earse)}></Button>
                  <div className={classNames('title')}></div>
                  { existedPen ? <Button className="single-article-content-menu-btn" type={penOnly ? "primary" : "link"} size="large" icon={<EditOutlined />} onClick={() => setPenOnly(!penOnly)}></Button> : undefined }
                  <Button className="single-article-content-menu-btn" type={expandMode ? "primary" : "link"} size="large" icon={<ColumnHeightOutlined />} onClick={() => setExpandMode(!expandMode)}></Button>
                  <Button className="single-article-content-menu-btn" type="link" size="large" danger icon={<CloseOutlined />} onClick={() => setFreeDraw(!freeDraw)}></Button>
                </>)
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
        <div ref={ref} className={classNames('article', freeDraw && expandMode ? "expanded-article":"")}>
          <div className="article-content">
            <props.type.Viewer articleId={props.article.id!} published={props.article.published} viewerCallbacks={callbacks} showAdditionals={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
          </div>
          <FreeDrawMask penOnly={penOnly} onPenFound={()=>{setExistedPen(true);setPenOnly(true)}} earse={earse} size={drawSize} color={drawColor} enabled={freeDraw} hidden={paging}></FreeDrawMask>
          {
            captureDict
              ? <CaptureDict offset={-50}></CaptureDict>
              : undefined}
        </div>
      </LocatableView>
    </LocatableOffsetProvider>
  )
}
