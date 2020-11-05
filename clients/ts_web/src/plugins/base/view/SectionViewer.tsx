import React from 'react'
import './SectionViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import ReactMarkdown from 'react-markdown'
import Highlight from '../common/Hightlight'

export default function CreateSectionViewer(getSectionType: { (name: string): string }) {
    return function SectionViewer(props: SectionViewerProps) {
        return <div onClick={props.onClick} className={classNames('section-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
            <label className="section-name">{props.section.name}</label>
            <ReactMarkdown renderers={{ code: Highlight }} source={'```' + `${getSectionType(props.section.name!)}\n` + props.section?.content + '\n```'} linkTarget="_blank"></ReactMarkdown>
        </div>
    }
}