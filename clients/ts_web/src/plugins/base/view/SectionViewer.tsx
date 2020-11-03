import React from 'react'
import './SectionViewer.less'
import classNames from 'classnames'
import SectionViewerProps, { SectionViewerCallbacks } from '../../base/view/SectionViewerProps'
import ReactMarkdown from 'react-markdown'
import Highlight from '../common/Hightlight'

export function SectionViewerWraper(props: SectionViewerProps & { callbacks?: SectionViewerCallbacks, TSectionViewer: { (props: SectionViewerProps): JSX.Element } }) {
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
        return <>
            <props.TSectionViewer {...props}></props.TSectionViewer>
            <span ref={ref} ></span>
        </>
    }
    return <props.TSectionViewer {...props}></props.TSectionViewer>
}

export default function CreateSectionViewer(getSectionType: { (name: string): string }) {
    return function SectionViewer(props: SectionViewerProps) {
        return <div onClick={props.onClick} className={classNames('section-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
            <label className="section-name">{props.section.name}</label>
            <ReactMarkdown renderers={{ code: Highlight }} source={'```' + `${getSectionType(props.section.name!)}\n` + props.section?.content + '\n```'} linkTarget="_blank"></ReactMarkdown>
        </div>
    }
}