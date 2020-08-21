import React, { useState, useEffect } from 'react'
import './ArticleSingle.less'
import { useServicesLocator } from '../../app/Contexts'
import { Button, Menu, Dropdown } from 'antd';
import { ArrowLeftOutlined, PictureOutlined, FontSizeOutlined, UnorderedListOutlined, BgColorsOutlined, ColumnHeightOutlined, ColumnWidthOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType, ArticleContentViewerCallbacks } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
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
export default function ArticleSingle(props: { article: Article, type: ArticleContentType }) {
    const locator = useServicesLocator()
    const [sections, setSections] = useState<string[]>([])
    const [currentSection, setCurrentSection] = useState('');
    const close = () => {
        locator.locate(IViewService).previewArticle()
    }
    const langs = locator.locate(ILangsService)
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
        console.log(ele)
    }
    callbacks.onSections = setSections;
    callbacks.onSection = setCurrentSection;
    return (
        <div className={classNames("single-article", getThemeClass(currentTheme), paging ? 'paging' : '')}>
            <div className={classNames("menus")} onClick={e => e.stopPropagation()}>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>
                {props.type.noTitle ? null : <div className={classNames("title")}>{props.article.name}</div>}
                {
                    !paging ?
                        <Dropdown overlay={
                            <Menu>
                                <Menu.Item>
                                    <Button className="single-article-content-menu-btn" type="link" size="large" icon={<PictureOutlined />} onClick={() => locator.locate(IViewService).captureElement(ref.current!)} >{langs.get(LangKeys.ScreenShot)}</Button>
                                </Menu.Item>
                                {
                                    sections.map(section => <Menu.Item onClick={() => {
                                        callbacks.gotoSection && callbacks.gotoSection(section)
                                    }}>{section}</Menu.Item>)
                                }
                            </Menu>}>
                            <Button className="single-article-content-menu-btn" type="link" size="large" icon={<UnorderedListOutlined />} onClick={(e) => e.preventDefault()} ></Button>
                        </Dropdown>
                        : null
                }
                {smallScreen ? <Dropdown overlay={
                    <Menu>
                        <Menu.Item>
                            <Button className="single-article-content-menu-btn" type="link" size="large" icon={<BgColorsOutlined />}
                                onClick={() => {
                                    var nextTheme = (currentTheme + 1) % themeCount
                                    setCurrentTheme(nextTheme)
                                    saveTheme(nextTheme)
                                }
                                }
                            >{langs.get(LangKeys.Themes)}</Button>
                        </Menu.Item>
                        <Menu.Item>
                            <Button className="single-article-content-menu-btn" type="link" size="large" icon={paging ? <ColumnHeightOutlined /> : <ColumnWidthOutlined />}
                                onClick={() => {
                                    var nextPaging = !paging
                                    setPaging(nextPaging)
                                    savePaging(nextPaging)
                                }
                                }
                            >{langs.get(paging ? LangKeys.Scroll : LangKeys.Paging)}</Button>
                        </Menu.Item>
                    </Menu>}>
                    <Button className="single-article-content-menu-btn" type="link" size="large" icon={<FontSizeOutlined />} onClick={(e) => e.preventDefault()} ></Button>
                </Dropdown> : null}
                {paging ? <div className="paging-buttons">
                    <Button onClick={prePage} type="link" size="large" className="paging-button paging-button-left" icon={<LeftCircleOutlined />} ></Button>
                    <Button onClick={nextPage} type="link" size="large" className="paging-button paging-button-right" icon={<RightCircleOutlined />} ></Button>
                </div> : null}
            </div>
            <div ref={ref} className={classNames("article")}>
                <props.type.Viewer published={props.article.published} viewerCallbacks={callbacks} showHiddens={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
            </div>
        </div>
    )
}