import './MathSectionEditor.less'
import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { FunctionOutlined } from '@ant-design/icons'
import { getSlices, SliceType } from './Slice'
import { Input, Button } from 'antd'
import classNames from 'classnames'
import MathSectionViewer from './MathSectionViewer'
import React, { useState, useRef } from 'react'
import SectionEditorProps from '../../../pluginbase/base/view/SectionEditorProps'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'

const TextArea = Input.TextArea

export class ILatexTranslator {
  test (slice: string): boolean {
    throw new Error('Method not implemented.')
  }

  translate (slice: string): string {
    throw new Error('Method not implemented.')
  }
}

export class DefaultLatexTranslator implements ILatexTranslator {
  test (_: string): boolean {
    return true
  }

  translate (slice: string): string {
    return slice.replace(/[\x20-\x7Fα-ωΑ-Ω]+/g, e => e.match(/[a-zA-Zα-ωΑ-Ω]/) ? '$' + e + '$' : e)
  }
}

export class WikipediaLatexTranslator implements ILatexTranslator {
  test (slice: string): boolean {
    return slice.indexOf('<math>') >= 0
  }

  translate (slice: string): string {
    return slice.replace(/\r?\n?<math>|<\/math>\r?\n?/g, () => '$')
  }
}

interface Formula {
    start: number;
    end: number;
    content: string;
    newFormula: boolean
}

const getFormulaAtPos = (content: string, pos: number): Formula | undefined => {
  const slices = getSlices(content)
  const slice = slices.find(s => s.end >= pos)
  if (!slice || slice.type === SliceType.Normal) {
    return { start: pos, end: pos, content: '', newFormula: true }
  }

  if (typeof slice.content !== 'string') {
    return
  }

  return { start: slice.start, end: slice.end, content: slice.content as string, newFormula: false }
}

const normalizeString = (slice: string) => {
  let newSlice = ''
  const ignoreChars = new Set(['⬚'])
  for (let i = 0; i < slice.length; i++) {
    if (slice.charCodeAt(i) >= 65281 && slice.charCodeAt(i) <= 65374) {
      newSlice += String.fromCharCode(slice.charCodeAt(i) - 65248)
    } else if (slice.charCodeAt(i) === 12288) {
      newSlice += ' '
    } else if (ignoreChars.has(slice[i])) {
      continue
    } else {
      newSlice += slice[i]
    }
  }
  return newSlice
}

const translateWordContent = (slice: string) => {
  slice = normalizeString(slice)
  const translator: ILatexTranslator = [new WikipediaLatexTranslator()].find(t => t.test(slice)) || new DefaultLatexTranslator()
  return translator.translate(slice)
}

export default function MathSectionEditor (props: SectionEditorProps) {
  const [filesDict] = useState(props.filesDict || new Map())
  const [content, setContent] = useState(props.section.content)
  const [refs] = useState<{ textArea?: HTMLTextAreaElement }>({})
  const ref = useRef<any>(null)
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
  const getNewFiles = ()=>{
    return Array.from(content.matchAll(/\$\$:(.*?)\$\$/g)).map(a => a[1])
  }
  props.callbacks.addFile = (file: ArticleFile) => {
    const text = `$$:${file.name}$$`
    filesDict.set(file.name!, file)
    insertContent(text)
  }
  props.callbacks.removeFile = (file: ArticleFile) => {
    setContent(content?.replace(`$$:${file.name}$$`, ''))
    filesDict.delete(file.name!)
  }
  props.callbacks.getEditedContent = () => {
    return [content, getNewFiles()]
  }
  const getFormula = (): Formula | undefined => {
    if (!refs.textArea) {
      return {
        start: content.length,
        end: content.length,
        content: '',
        newFormula: true
      }
    }
    const textArea = refs.textArea!
    return getFormulaAtPos(content, textArea.selectionStart)
  }
  const editFormula = async () => {
    const formula = getFormula()
    if (!formula) {
      return
    }
    {
      if (!refs.textArea) {
        return
      }
      const textArea = refs.textArea!
      textArea.setSelectionRange(formula.start, formula.start + (formula.content.length || 0))
      textArea.focus()
    }
    const newFormula = (await props.formulaEditor!.edit(formula.content)) || ' '
    if (formula.newFormula && (!newFormula || !newFormula.trim())) {
      return
    }
    setContent(content.slice(0, formula.start) + (formula.newFormula ? `$${newFormula}$` : newFormula) + content.slice(formula.end))
    setTimeout(() => {
      if (!refs.textArea) {
        return
      }
      const textArea = refs.textArea!
      const start = formula.newFormula ? formula.start + 1 : formula.start
      textArea.setSelectionRange(start, start + (newFormula?.length || 0))
      textArea.focus()
    }, 0)
  }
  return (props.editing
    ? <div className={classNames('math-section-editor', props.section.name)}>
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
        onKeyDown={(e) => {
          if (e.key === 'f' && e.ctrlKey && !e.shiftKey && !e.metaKey && props.formulaEditor) {
            editFormula()
          }
        }}
        onChange={(e) => {
          refs.textArea = e.target
          setContent(e.target.value)
        }}
        onPaste={(e) => {
          if (!e.clipboardData) {
            return
          }
          const types = Seperators.joinItems(e.clipboardData.types)
          switch (types) {
            case `text/plain${Seperators.Items}text/html${Seperators.Items}text/rtf`:
            case `text/plain${Seperators.Items}text/html${Seperators.Items}text/rtf${Seperators.Items}Files`:
              e.preventDefault()
              e.clipboardData.items[0].getAsString(s => insertContent(translateWordContent(s)))
              return
            case 'Files':
            case `text/html${Seperators.Items}Files`:
              e.preventDefault()
              // eslint-disable-next-line no-case-declarations
              const file = e.clipboardData.files[0]
              if (file && (file.type.match(/image\/.*/) || file.type.match(/video\/.*/))) {
                props.onpaste(file)
              }
          }
        }}
      ></TextArea>
      {
        props.formulaEditor ? <Button type="link" onClick={() => { editFormula() }} className="btn-formula" icon={<FunctionOutlined />}></Button> : null
      }
    </div >
    : <MathSectionViewer onClick={props.onClick} section={Object.assign({}, props.section, { content })} filesDict={filesDict} pureViewMode={false}></MathSectionViewer>
  )
}
