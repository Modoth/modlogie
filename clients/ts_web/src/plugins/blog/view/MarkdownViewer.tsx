import React, { LabelHTMLAttributes } from 'react'
import './MarkdownViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import { useServicesLocator, useUser } from '../../../view/Contexts'
import IViewService from '../../../app/Interfaces/IViewService'
import language from 'react-syntax-highlighter/dist/esm/languages/hljs/1c'
import { ArticlePreview } from '../../../view/pages/ArticlePreview'
import { previewArticleByPath } from '../../../view/pages/ServiceView'
import IServicesLocator from "../../../infrac/ServiceLocator/IServicesLocator"
import { EditOutlined } from '@ant-design/icons'
import Highlight from '../../base/common/Hightlight'

const getRenders = (locator: IServicesLocator) => {
    const user = useUser();
    return ({
        code: (props: { language: string, value: string }) => {
            if (props.language === 'article') {
                let path = props.value && props.value.trim()
                if (!path) {
                    return undefined
                }
                return <div className="ref-article">{user.editingPermission ? <EditOutlined className="jump-to" onClick={previewArticleByPath(locator, path, path.split('/').pop())} /> : undefined}<ArticlePreview path={path}></ArticlePreview></div>
            }
            return <Highlight language={props.language} value={props.value}></Highlight>
        }
    })
}

export default function MarkdownViewer(props: SectionViewerProps) {
    const locator = useServicesLocator();
    const renderers = getRenders(locator) as any
    return <div onClick={(e) => {
        if ((e.target as any)?.nodeName === 'A') {
            return
        }
        if (props.onClick) {
            props.onClick(e)
        }
    }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
    </div>
}