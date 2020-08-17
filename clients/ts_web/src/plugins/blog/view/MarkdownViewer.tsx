import React, { LabelHTMLAttributes } from 'react'
import './MarkdownViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import ReactMarkdown, { uriTransformer } from 'react-markdown'
import { useServicesLocator } from '../../../app/Contexts'
import INavigationService from '../../../view/services/INavigationService'
import IViewService from '../../../view/services/IViewService'

export default function MarkdownViewer(props: SectionViewerProps) {
    const ref = React.createRef<HTMLSpanElement>()
    const locator = useServicesLocator();
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
    const navigateTo = async (title: string | undefined, url: string | undefined) => {
        var viewService = locator.locate(IViewService)
        viewService.setLoading(true);
        try {
            await locator.locate(INavigationService).promptGoto(title, url);
        }
        finally {
            viewService.setLoading(false);
        }
    }
    return <div onClick={(e) => {
        if ((e.target as any)?.nodeName === 'A') {
            const a: HTMLLinkElement = e.target as HTMLLinkElement
            e.stopPropagation();
            e.preventDefault();
            navigateTo(a.innerText.trim(), a.href && uriTransformer(a.href))
            return
        }
        if (props.onClick) {
            props.onClick(e)
        }
    }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <span ref={ref} ></span>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
    </div>
}