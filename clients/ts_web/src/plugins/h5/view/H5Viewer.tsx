import React, { LabelHTMLAttributes } from 'react'
import './H5Viewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import ReactMarkdown from 'react-markdown'
import Highlight from '../../modlang/view/Hightlight'

export default function H5Viewer(props: SectionViewerProps) {
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
    return <div onClick={props.onClick} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <span ref={ref} ></span>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown renderers={{ code: Highlight }} source={'```' + `${props.section.name}\n` + props.section?.content + '\n```'} linkTarget="_blank"></ReactMarkdown>
    </div>
}