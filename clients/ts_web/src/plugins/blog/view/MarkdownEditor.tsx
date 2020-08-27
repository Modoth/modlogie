import React, { useState, useRef } from 'react'
import './MarkdownEditor.less'
import { ArticleFile } from '../../../domain/Article'
import MarkdownViewer from './MarkdownViewer'
import classNames from 'classnames'
import SectionEditorProps from '../../sections-base/view/SectionEditorProps'
import TextArea from 'antd/lib/input/TextArea'

const translateHtml2Markdown = (html: string) => {
    return html;
}

export default function MarkdownEditor(props: SectionEditorProps) {
    const [filesDict] = useState(props.filesDict || new Map())
    const [content, setContent] = useState(props.section.content)
    const [refs] = useState<{ textArea?: HTMLTextAreaElement }>({})
    const ref = useRef<any>(null)
    const insertContent = (text: string) => {
        let oldContent = content || ''
        if (!refs.textArea) {
            console.log('Insert failed')
            setContent(oldContent + text)
            return
        }
        const textArea = refs.textArea!
        const [start, end] = [textArea.selectionStart, textArea.selectionEnd]
        setContent(oldContent.slice(0, start) + text + oldContent.slice(end))
    }
    const getFileContent = (file: ArticleFile) => {
        return `![${file.name}](${file.url})`
    }
    props.callbacks.addFile = (file: ArticleFile) => {
        const text = getFileContent(file);
        filesDict.set(file.name!, file)
        insertContent(text)
    }
    props.callbacks.remoteFile = (file: ArticleFile) => {
        setContent(content?.replace(getFileContent(file), ''))
        filesDict.delete(file.name!)
    }
    props.callbacks.getEditedContent = () => {
        return content
    }
    return (props.editing ?
        <div className={classNames('md-editor', props.section.name?.match(/(^.*?)(\(|（|$)/)![1])}>
            <label className="md-name">{props.section.name}</label>
            <TextArea
                autoFocus
                autoSize={{ minRows: 1 }}
                rows={1}
                className="md-content"
                value={content}
                onFocus={(e) => {
                    refs.textArea = e.target as HTMLTextAreaElement
                }}
                onChange={(e) => {
                    refs.textArea = e.target
                    setContent(e.target.value)
                }}
            // onPaste={(e) => {
            //     if (!e.clipboardData) {
            //         return
            //     }
            //     const types = e.clipboardData.types.join(' ')
            //     switch (types) {
            //         case 'text/plain text/html':
            //             e.preventDefault()
            //             e.clipboardData.items[1].getAsString(s => insertContent(translateHtml2Markdown(s)))
            //             return
            //     }
            // }}
            ></TextArea>
        </div >
        :
        <MarkdownViewer onClick={props.onClick} section={Object.assign({}, props.section, { content })} filesDict={filesDict} pureViewMode={false}></MarkdownViewer>
    )
}