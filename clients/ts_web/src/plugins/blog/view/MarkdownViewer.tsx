import React, { LabelHTMLAttributes } from 'react'
import './MarkdownViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import { useServicesLocator } from '../../../app/Contexts'
import INavigationService from '../../../view/services/INavigationService'
import IViewService from '../../../view/services/IViewService'
import language from 'react-syntax-highlighter/dist/esm/languages/hljs/1c'
import Highlight from '../../modlang/view/Hightlight'
import { ArticlePreview } from '../../../view/pages/ArticlePreview'
import { previewArticleByPath } from '../../../view/pages/ServiceView'
import IServicesLocator from '../../../common/IServicesLocator'
import { ArrowRightOutlined } from '@ant-design/icons'

const getRenders = (locator: IServicesLocator) => {
    return ({
        code: (props: { language: string, value: string }) => {
            if (props.language === 'article') {
                var path = props.value && props.value.trim()
                if (!path) {
                    return undefined
                }
                return <div className="ref-article"><ArrowRightOutlined className="jump-to" onClick={previewArticleByPath(locator, path, path.split('/').pop())} /><ArticlePreview path={path}></ArticlePreview></div>
            }
            return <Highlight language={props.language} value={props.value}></Highlight>
        }
    })
}

export default function MarkdownViewer(props: SectionViewerProps) {
    const ref = React.createRef<HTMLSpanElement>()
    const locator = useServicesLocator();
    const renderers = getRenders(locator) as any
    if (props.callbacks) {
        props.callbacks.focus = () => {
            if (ref.current) {
                var offset = 60;
                const bodyPos = document.body.getBoundingClientRect().top;
                var elementPos = ref.current.getBoundingClientRect().top;
                var offsetPosition = elementPos - bodyPos - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    }

    return <div onClick={(e) => {
        if ((e.target as any)?.nodeName === 'A') {
            return
        }
        if (props.onClick) {
            props.onClick(e)
        }
    }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}>
        <span ref={ref} ></span>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
    </div>
}