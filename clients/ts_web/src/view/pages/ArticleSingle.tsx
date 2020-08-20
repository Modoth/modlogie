import React, { useState, useEffect } from 'react'
import './ArticleSingle.less'
import { useServicesLocator } from '../../app/Contexts'
import { Button, Menu, Dropdown } from 'antd';
import { ArrowLeftOutlined, PictureOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType, ArticleContentViewerCallbacks } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
export default function ArticleSingle(props: { article: Article, type: ArticleContentType }) {
    const locator = useServicesLocator()
    const [sections, setSections] = useState<string[]>([])
    const [currentSection, setCurrentSection] = useState('');
    const close = () => {
        locator.locate(IViewService).previewArticle()
    }
    const langs = locator.locate(ILangsService)
    const ref = React.createRef<HTMLDivElement>()
    const [callbacks] = useState({} as ArticleContentViewerCallbacks)
    callbacks.onSections = setSections;
    callbacks.onSection = setCurrentSection;
    return (
        <div className={classNames("single-article")}>
            <div className={classNames("menus")} onClick={e => e.stopPropagation()}>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>
                {props.type.noTitle ? null : <div className={classNames("title")}>{props.article.name}</div>}
                {
                    sections && sections.length ?
                        <Dropdown overlay={<Menu>
                            <Menu.Item>
                                <Button className="single-article-content-menu-btn" type="link" size="large" icon={<PictureOutlined />} onClick={() => locator.locate(IViewService).captureElement(ref.current!)} >{langs.get(LangKeys.ScreenShot)}</Button>
                            </Menu.Item>
                            {
                                sections.map(section => <Menu.Item onClick={() => {
                                    callbacks.gotoSection && callbacks.gotoSection(section)
                                }}>{section}</Menu.Item>)
                            }
                        </Menu>}>
                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                {langs.get(LangKeys.Sections)}
                            </a>
                        </Dropdown>
                        : null
                }
            </div>
            <div ref={ref} className="article">
                <props.type.Viewer published={props.article.published} viewerCallbacks={callbacks} showHiddens={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
            </div>
        </div>
    )
}