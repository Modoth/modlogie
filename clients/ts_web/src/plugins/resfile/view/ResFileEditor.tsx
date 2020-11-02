import React, { useState, useRef } from 'react'
import './ResFileEditor.less'
import { ArticleFile } from '../../../domain/Article'
import ResFileViewer from './ResFileViewer'
import classNames from 'classnames'
import SectionEditorProps from '../../sections-base/view/SectionEditorProps'
import TextArea from 'antd/lib/input/TextArea'
import { ResFile } from '../ResFile'
import yaml from 'yaml'
import ReactMarkdown from 'react-markdown'
import Highlight from '../../modlang/view/Hightlight'

export default function ResFileEditor(props: SectionEditorProps) {
    const [filesDict] = useState(props.filesDict || new Map())
    const [content, setContent] = useState(props.section.content)
    const getFileContent = (file: ArticleFile) => {
        var fileInfo = new ResFile(file.name!)
        return yaml.stringify(fileInfo)
    }
    props.callbacks.addFile = (file: ArticleFile) => {
        const text = getFileContent(file);
        filesDict.set(file.name!, file)
        setContent(text)
    }
    props.callbacks.remoteFile = (file: ArticleFile) => {
        setContent('')
        filesDict.delete(file.name!)
    }
    props.callbacks.getEditedContent = () => {
        return content
    }
    return (props.editing ?
        <div className={classNames('resfile-editor', props.section.name?.match(/(^.*?)(\(|（|$)/)![1])}>
            <label className="resfile-name">{props.section.name}</label>
            <TextArea
                autoFocus
                autoSize={{ minRows: 1 }}
                rows={1}
                className="resfile-content"
                value={content}
            ></TextArea>
        </div >
        :
        <div onClick={props.onClick} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], 'edit-mode')} key={props.section.name}>
            <label className="md-name">{props.section.name}</label>
            <ReactMarkdown renderers={{ code: Highlight }} source={'```yml\n' + content + '\n```'} linkTarget="_blank"></ReactMarkdown>
        </div>
    )
}