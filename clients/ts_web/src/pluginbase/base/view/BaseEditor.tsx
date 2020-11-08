import './BaseEditor.less'
import { ArticleContentEditorProps, ArticleContentType } from '../../IPluginInfo'
import { ArticleFile, ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import React, { useState, useEffect } from 'react'
import SectionEditorProps from './SectionEditorProps'
import SectionViewerProps from './SectionViewerProps'

const getSections = (allSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  return Array.from(allSections, (name) => Object.assign((existedSections.get(name) || { name, content: '' })))
}

export default function BaseEditor (TSectionEditor: { (props: SectionEditorProps): JSX.Element }, TSectionViewer: { (props: SectionViewerProps): JSX.Element }, pluginName: string) {
  // eslint-disable-next-line react/display-name
  return (props: ArticleContentEditorProps) => {
    const [type, setType] = useState<ArticleContentType | undefined>(undefined)
    const [sections, setSections] = useState<ArticleSection[]>([])
    const [sectionOps] = useState(new Map<ArticleSection, any>())
    useEffect(() => {
      if (props.type === type) {
        return
      }
      setType(props.type)
      const secs = getSections(props.type?.allSections!, sections.length ? sections : props.content.sections)
      secs.forEach(s => sectionOps.set(s, {}))
      setSections(secs)
    })
    const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
    const [currentSection, setCurrentSection] = useState<ArticleSection | undefined>(undefined)
    const saveCurrentSectionAndChange = (next: ArticleSection) => {
      if (currentSection) {
        currentSection.content = sectionOps.get(currentSection).getEditedContent()
      }
      setCurrentSection(next)
    }
    props.callbacks.addFile = (file: ArticleFile) => {
      if (currentSection) {
        sectionOps.get(currentSection).addFile(file)
      }
    }
    props.callbacks.remoteFile = (file: ArticleFile) => {
      for (const section of sections) {
        sectionOps.get(section).remoteFile(file)
      }
    }
    props.callbacks.getEditedContent = () => {
      if (currentSection) {
        currentSection.content = sectionOps.get(currentSection).getEditedContent()
      }
      return {
        sections: sections.map(s => ({ content: s.content, name: s.name }))
      }
    }
    return <div className={classNames(props.className, props.type?.name, pluginName, 'base-editor')}>
      {sections.map(section =>
        <TSectionEditor viewer={TSectionViewer} formulaEditor={undefined} callbacks={sectionOps.get(section)} onpaste={props.onpaste} key={section.name} onClick={section === currentSection ? undefined : () => saveCurrentSectionAndChange(section)} section={section} filesDict={filesDict} editing={section === currentSection}></TSectionEditor>
      )}
    </div >
  }
}
