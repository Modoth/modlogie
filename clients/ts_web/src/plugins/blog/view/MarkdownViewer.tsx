import React from 'react'
import './MarkdownViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import ReactMarkdown from 'react-markdown'

export default function MarkdownViewer(props: SectionViewerProps) {
    return <div onClick={props.onClick} className={classNames('md-viewer', props.section.name, props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <label className="md-name">{props.section.name}</label>
        <ReactMarkdown source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
    </div>
}