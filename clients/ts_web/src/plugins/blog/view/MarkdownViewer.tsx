import React, { LabelHTMLAttributes } from 'react'
import './MarkdownViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import ReactMarkdown from 'react-markdown'

export default function MarkdownViewer(props: SectionViewerProps) {
    const ref = React.createRef<HTMLSpanElement>()
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
    return <div onClick={props.onClick} className={classNames('md-viewer', props.section.name, props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <span ref={ref} ></span>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
    </div>
}