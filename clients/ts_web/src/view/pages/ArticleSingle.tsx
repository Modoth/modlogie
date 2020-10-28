import React, { useState, useEffect } from 'react'
import './ArticleSingle.less'
import { useServicesLocator } from '../../app/Contexts'
import { Button, Menu, Dropdown } from 'antd';
import { ClearOutlined, HighlightOutlined, BulbOutlined, BulbFilled, CloseOutlined, ArrowLeftOutlined, PictureOutlined, FontSizeOutlined, UnorderedListOutlined, BgColorsOutlined, ColumnHeightOutlined, ColumnWidthOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType, ArticleContentViewerCallbacks } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
import FreeDrawMask from '../components/FreeDrawMask';
import CaptureDict from './CaptureDict';
const themeCount = 3
const getThemeClass = (idx: number) => idx > 0 ? `reading-theme reading-theme-${idx}` : ''
const getThemeKey = () => 'READING_THEME'
const loadTheme = () => {
    var theme = localStorage.getItem(getThemeKey())
    if (!theme) {
        return 0
    }
    return parseInt(theme) || 0
}
const saveTheme = (theme: number) => {
    if (theme) {
        localStorage.setItem(getThemeKey(), theme.toString())
    } else {
        localStorage.removeItem(getThemeKey())
    }
}
const getPaingKey = () => 'READING_PAIGING'
const loadPaging = () => {
    var paging = localStorage.getItem(getPaingKey())
    return paging === 'true'
}
const savePaging = (paging: boolean) => {
    if (paging) {
        localStorage.setItem(getPaingKey(), 'true')
    } else {
        localStorage.removeItem(getPaingKey())
    }
}
const drawSizes = [1, 5, 15]
const drawColors = ['#2d2d2d', '#ff0000', '#ffff0080']
export default function ArticleSingle(props: { article: Article, type: ArticleContentType }) {
    const locator = useServicesLocator()
    const [sections, setSections] = useState<string[]>([])
    const [currentSection, setCurrentSection] = useState('');
    const [drawSize, setDrawSize] = useState(drawSizes[0]);
    const [drawColor, setDrawColors] = useState(drawColors[0])
    const [earse, setEarse] = useState(false)
    const close = () => {
        locator.locate(IViewService).previewArticle()
    }
    const langs = locator.locate(ILangsService)
    const [freeDraw, setFreeDraw] = useState(false)
    const [showDict, setShowDict] = useState(false)
    const smallScreen = window.matchMedia && window.matchMedia("(max-width: 780px)")?.matches
    const [currentTheme, setCurrentTheme] = useState(smallScreen ? loadTheme() : 0)
    const [paging, setPaging] = useState(smallScreen ? loadPaging() : false)
    const ref = React.createRef<HTMLDivElement>()
    const [callbacks] = useState({} as ArticleContentViewerCallbacks)
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
        var ele = ref.current!;
        var par = ref.current.offsetParent!;
        var width = ele.clientWidth;
        if (!width) {
            return
        }
        var currentPage = Math.floor(par.scrollLeft / width)
        par.scroll({ left: (currentPage + i) * width, behavior: "smooth" })
    }
    callbacks.onSections = setSections;
    callbacks.onSection = setCurrentSection;
    return (
        <div className={classNames("single-article", getThemeClass(currentTheme), paging ? 'paging' : '')}>
            <div className={classNames("menus")}>
                {
                    showDict ?
                        <div className="menus-dict"><CaptureDict></CaptureDict>
                            <Button className="single-article-content-menu-btn" type="link" size="large" danger icon={<CloseOutlined />} onClick={() => setShowDict(false)}></Button></div> :
                        <div className={classNames("menus-bar")} onClick={e => e.stopPropagation()}>
                            {freeDraw ? undefined : <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>}
                            {
                                !freeDraw ? (<>{props.type.noTitle ? <div className={classNames("title")}></div> : <div className={classNames("title")}>{props.article.name}</div>}
                                    {paging ? <div className="paging-buttons">
                                        <Button onClick={prePage} type="link" size="large" className="paging-button paging-button-left" icon={<LeftCircleOutlined />} ></Button>
                                        <Button onClick={nextPage} type="link" size="large" className="paging-button paging-button-right" icon={<RightCircleOutlined />} ></Button>
                                    </div> : null}
                                    {
                                        <Dropdown trigger={['click']} overlay={
                                            <Menu>
                                                {paging ? null :
                                                    sections.map(section => <Menu.Item onClick={() => {
                                                        callbacks.gotoSection && callbacks.gotoSection(section)
                                                    }}>{section}</Menu.Item>).concat(
                                                        <Menu.Divider></Menu.Divider>,
                                                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={<PictureOutlined />} onClick={() => locator.locate(IViewService).captureElement(ref.current!)} >{langs.get(LangKeys.ScreenShot)}</Button></Menu.Item>,
                                                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={<HighlightOutlined />} onClick={() => setFreeDraw(!freeDraw)}>{langs.get(LangKeys.FreeDraw)}</Button></Menu.Item>,
                                                        <Menu.Item><Button className="single-article-content-menu-btn" type="link" size="large" icon={showDict ? <BulbFilled /> : <BulbOutlined />} onClick={() => setShowDict(!showDict)}>{langs.get(LangKeys.CaptureWord)}</Button></Menu.Item>,
                                                    )
                                                }
                                                {smallScreen ? [<Menu.Item>
                                                    <Button className="single-article-content-menu-btn" type="link" size="large" icon={<BgColorsOutlined />}
                                                        onClick={() => {
                                                            var nextTheme = (currentTheme + 1) % themeCount
                                                            setCurrentTheme(nextTheme)
                                                            saveTheme(nextTheme)
                                                        }
                                                        }
                                                    >{langs.get(LangKeys.Themes)}</Button>
                                                </Menu.Item>,
                                                <Menu.Item>
                                                    <Button className="single-article-content-menu-btn" type="link" size="large" icon={paging ? <ColumnHeightOutlined /> : <ColumnWidthOutlined />}
                                                        onClick={() => {
                                                            var nextPaging = !paging
                                                            setPaging(nextPaging)
                                                            savePaging(nextPaging)
                                                        }
                                                        }
                                                    >{langs.get(paging ? LangKeys.Scroll : LangKeys.Paging)}</Button>
                                                </Menu.Item>] : null}
                                            </Menu>}>
                                            <Button className="single-article-content-menu-btn" type="link" size="large" icon={<UnorderedListOutlined />} onClick={(e) => e.preventDefault()} ></Button>
                                        </Dropdown>
                                    }</>) : (<>
                                        {drawSizes.map(s => <Button className="single-article-content-menu-btn" type={s === drawSize ? "primary" : "link"} size="large" icon={<span className="pen-size" style={{ height: `${s}px`, background: drawColor }}></span>} onClick={() => setDrawSize(s)}></Button>)}
                                        {drawColors.map(c => <Button className="single-article-content-menu-btn" type={c === drawColor ? "primary" : "link"} size="large" icon={<BgColorsOutlined style={{ color: c }} />} onClick={() => setDrawColors(c)}></Button>)}
                                        <Button className="single-article-content-menu-btn" size="large" type={earse ? "primary" : "link"} icon={<ClearOutlined style={{ color: drawColor }} />} onClick={() => setEarse(!earse)}></Button>
                                        <div className={classNames("title")}></div>
                                        <Button className="single-article-content-menu-btn" type="link" size="large" danger icon={<CloseOutlined />} onClick={() => setFreeDraw(!freeDraw)}></Button>
                                    </>)
                            }
                        </div>
                }
            </div>
            <div ref={ref} className={classNames("article")}>
                <props.type.Viewer published={props.article.published} viewerCallbacks={callbacks} showAdditionals={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
                <FreeDrawMask earse={earse} size={drawSize} color={drawColor} enabled={freeDraw} hidden={paging}></FreeDrawMask>
            </div>
        </div>
    )
}