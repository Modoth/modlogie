import './SectionEditor.less'
import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import React, { useState, useRef } from 'react'
import SectionEditorProps from './SectionEditorProps'
import SectionViewerProps from './SectionViewerProps'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'
import TextArea from 'antd/lib/input/TextArea'

type Modifiers =
    ({
        getSectionFileContent?(name: string): { (file: ArticleFile): string },
        getFilesInSectionContent?(name: string): { (content: string): string[] },
        getPasteSectionContent?(name: string, types: string): ((data: DataTransfer) => Promise<string>) | undefined
    } &
    {
        addSectionFileContent?(name: string): { (content: string | undefined, file: ArticleFile): string },
        removeSectionFileContent?(name: string): { (content: string | undefined, file: ArticleFile): string }
    })
    & { viewer?: { (props: SectionViewerProps): JSX.Element } }

export default function CreateSectionEditor (modifiers: Modifiers = {}) {
  return function SectionEditor (props: SectionEditorProps) {
    const TViewer = modifiers.viewer || props.viewer
    const [filesDict] = useState(props.filesDict || new Map())
    const [content, setContent] = useState(props.section.content)
    const [refs] = useState<{ textArea?: HTMLTextAreaElement }>({})
    const insertContent = (text: string) => {
      const oldContent = content || ''
      if (!refs.textArea) {
        console.log('Insert failed')
        setContent(oldContent + text)
        return
      }
      const textArea = refs.textArea!
      const [start, end] = [textArea.selectionStart, textArea.selectionEnd]
      setContent(oldContent.slice(0, start) + text + oldContent.slice(end))
    }
    if (modifiers.getSectionFileContent) {
      const getFileContent = modifiers.getSectionFileContent(props.section.name!)
      props.callbacks.addFile = (file: ArticleFile) => {
        const text = getFileContent(file)
        filesDict.set(file.name!, file)
        insertContent(text)
      }
      props.callbacks.removeFile = (file: ArticleFile) => {
        setContent(content?.replace(getFileContent(file), ''))
        filesDict.delete(file.name!)
      }
    } else {
      props.callbacks.addFile = (file: ArticleFile) => {
        filesDict.set(file.name!, file)
        if (modifiers.addSectionFileContent) {
          setContent(modifiers.addSectionFileContent(props.section.name!)!(content, file))
        }
      }
      props.callbacks.removeFile = (file: ArticleFile) => {
        filesDict.delete(file.name!)
        if (modifiers.removeSectionFileContent) {
          setContent(modifiers.removeSectionFileContent(props.section.name!)!(content, file))
        }
      }
    }

    props.callbacks.getEditedContent = () => {
      return [content, modifiers.getFilesInSectionContent?.(props.section.name!)?.(content) || []]
    }
    return (props.editing
      ? <div className={classNames('section-editor', props.section.name?.match(/(^.*?)(\(|（|$)/)![1])}>
        <label className="section-name">{props.section.name}</label>
        <TextArea
          autoFocus
          autoSize={{ minRows: 1 }}
          rows={1}
          className="section-content"
          value={content}
          onFocus={(e) => {
            refs.textArea = e.target as HTMLTextAreaElement
          }}
          onChange={(e) => {
            refs.textArea = e.target
            setContent(e.target.value)
          }}
          onPaste={async (e) => {
            if (!e.clipboardData || !modifiers.getPasteSectionContent) {
              return
            }
            const types = Seperators.joinItems(e.clipboardData.types)
            const getContent = modifiers.getPasteSectionContent(props.section.name!, types!)
            if (getContent) {
              e.preventDefault()
              insertContent(await getContent(e.clipboardData))
            }
          }}
        ></TextArea>
      </div >
      : <TViewer onClick={props.onClick} section={Object.assign({}, props.section, { content })} filesDict={filesDict} pureViewMode={false}></TViewer>
    )
  }
}
