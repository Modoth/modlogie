import React, { useState } from 'react'
import './ArticleSingle.less'
import { useServicesLocator } from '../../app/Contexts'
import { Button, Menu, Dropdown } from 'antd';
import { ArrowLeftOutlined, MenuOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType, ArticleContentViewerCallbacks } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
const Configs = {} as any;
import { generateRandomStyle } from './common';
import MenuItem from 'antd/lib/menu/MenuItem';
import { MenuIcon } from '../components/Icons';
const { SubMenu } = Menu;
export default function ArticleSingle(props: { article: Article, type: ArticleContentType }) {
    const locator = useServicesLocator()
    const [sections, setSections] = useState<string[]>([])
    const [currentSection, setCurrentSection] = useState('');
    const close = () => {
        locator.locate(IViewService).previewArticle()
    }
    const langs = locator.locate(ILangsService)
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
                        <Dropdown overlay={<Menu>{
                            sections.map(section => <Menu.Item onClick={() => {
                                callbacks.gotoSection && callbacks.gotoSection(section)
                            }}>{section}</Menu.Item>)
                        }</Menu>}>
                            <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                                {langs.get(LangKeys.Sections)}<MenuOutlined className="sections-icon" />
                            </a>
                        </Dropdown>
                        : null
                }
            </div>
            <div className="article">
                <props.type.Viewer viewerCallbacks={callbacks} showHiddens={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
            </div>
        </div>
    )
}