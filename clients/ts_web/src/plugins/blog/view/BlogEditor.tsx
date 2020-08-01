import React, { useState, useEffect } from 'react'
import { ArticleContentEditorProps, ArticleContentType } from '../../IPluginInfo'
import './BlogEditor.less'
import { ArticleFile, ArticleSection } from '../../../domain/Article'
import SectionEditor, { ArticleSectionVm } from './SectionEditor'

const getSections = (allSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSectionVm>()
  return Array.from(allSections, (name) => Object.assign((existedSections.get(name) || { name, content: '' }), { callbacks: {} }) as ArticleSectionVm)
}

export default function BlogEditor(props: ArticleContentEditorProps) {
  const [type, setType] = useState<ArticleContentType | undefined>(undefined)
  const [sections, setSections] = useState<ArticleSectionVm[]>([])
  useEffect(() => {
    if (props.type === type) {
      return
    }
    setType(props.type)
    setSections(getSections(props.type?.allSections!, sections.length ? sections : props.content.sections))
  })
  const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
  const [currentSection, setCurrentSection] = useState<ArticleSectionVm | undefined>(undefined)
  const saveCurrentSectionAndChange = (next: ArticleSectionVm) => {
    if (currentSection) {
      currentSection.content = currentSection.callbacks.getEditedContent()
    }
    setCurrentSection(next)
  }
  props.callbacks.addFile = (file: ArticleFile) => {
    if (currentSection) {
      currentSection.callbacks.addFile(file)
    }
  }
  props.callbacks.remoteFile = (file: ArticleFile) => {
    for (const section of sections) {
      section.callbacks.remoteFile(file)
    }
  }
  props.callbacks.getEditedContent = () => {
    if (currentSection) {
      currentSection.content = currentSection.callbacks.getEditedContent()
    }
    return {
      sections: sections.map(s => ({ content: s.content, name: s.name }))
    }
  }
  return <div className="blog-editor">
    {sections.map(section =>
      <SectionEditor formulaEditor={undefined} onpaste={props.onpaste} key={section.name} onClick={section === currentSection ? undefined : () => saveCurrentSectionAndChange(section)} section={section} filesDict={filesDict} editing={section === currentSection}></SectionEditor>
    )}
  </div >
}
