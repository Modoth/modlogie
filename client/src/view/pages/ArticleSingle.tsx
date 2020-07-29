import React from 'react'
import './ArticleSingle.less'
import { useServicesLocator } from '../../app/Contexts'
import { Button } from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons'
import Article from '../../domain/Article';
import { ArticleContentType } from '../../plugins/IPluginInfo';
import classNames from 'classnames';
import IViewService from '../services/IViewService';
import ILangsService from '../../domain/ILangsService';
const Configs = {} as any;
import { generateRandomStyle } from './common';
export default function ArticleSingle(props: { article: Article, type: ArticleContentType }) {
    const locator = useServicesLocator()
    const close = () => {
        locator.locate(IViewService).previewArticle()
    }
    return (
        <div className={classNames("single-article")}>
            <div className={classNames("menus")} onClick={e => e.stopPropagation()}>
                <Button type="link" size="large" icon={<ArrowLeftOutlined />} onClick={close} ></Button>
                <div className={classNames("title")}>{props.article.name}</div>
            </div>
            <props.type.Viewer className="article" showHiddens={true} content={props.article.content!} files={props.article.files} type={props.type}></props.type.Viewer>
        </div>
    )
}