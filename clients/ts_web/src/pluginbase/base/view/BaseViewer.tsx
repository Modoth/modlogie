import './BaseViewer.less'
import { ArticleContentViewerProps, NavigationSection } from '../../IPluginInfo'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import LocatableView, { LocatableViewCallbacks } from '../../../infrac/components/LocatableView'
import React, { useState, useEffect, memo } from 'react'
import SectionViewerProps, { AdditionalSectionViewerProps } from './SectionViewerProps'

export interface ArticleSectionVm extends ArticleSection {
  additionalSection?: boolean;
  firstSection?: boolean;
}

const getSections = (allSections: Set<string>, additionalSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  const s = Array.from(allSections, (name) => Object.assign(existedSections.get(name) || { name, content: '' }, { additionalSection: additionalSections && additionalSections.has(name) }) as ArticleSectionVm)
  if (s[0]) {
    s[0].firstSection = true
  }
  return s
}

export default function BaseViewer (TSectionViewer: { (props: SectionViewerProps): JSX.Element }, pluginName: string,
  TAdditionalSectionsViewer?: { (props: AdditionalSectionViewerProps): JSX.Element }) {
  const TAdditionalSectionsViewerMemo = TAdditionalSectionsViewer ? memo(TAdditionalSectionsViewer) : null
  // eslint-disable-next-line react/display-name
  return (props: ArticleContentViewerProps) => {
    const [filesDict] = useState(() => props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
    const [sections] = useState(() => (getSections(props.type?.allSections!, props.type?.additionalSections!, props.content?.sections || [])))
    const [showAdditional] = useState(props.showAdditionals === true)
    const [navigationSections] = useState(() => sections.map(s => (() => {
      var sec: NavigationSection & LocatableViewCallbacks & { section: ArticleSectionVm } = new NavigationSection(s.name!) as any
      sec.section = s
      return sec
    })()))
    useEffect(() => {
      if (props.viewerCallbacks) {
        if (props.viewerCallbacks.onSections) {
          props.viewerCallbacks.onSections(navigationSections.map(s => s).filter(s => s.locate))
        }
      }
    }, [sections])
    return (
      <div className={classNames(props.className, props.type?.name, pluginName, 'base-viewer')} onClick={(e) => {
        if (props.onClick) {
          props.onClick(e)
        }
      }
      }>
        {props.showTitle ? <h4 className="article-title">{props.title}</h4> : null}
        {props.published ? <span className="published-date">{props.published.toLocaleDateString()}</span> : null}
        {props.tags && props.tags.length ? props.tags.map(t => <span key={t.name}></span>) : null}
        {
          TAdditionalSectionsViewerMemo
            ? <TAdditionalSectionsViewerMemo articleId={props.articleId} type={props.type!.articleType!} summaryMode={!showAdditional} sections={sections} filesDict={filesDict} ></TAdditionalSectionsViewerMemo>
            : null
        }
        {navigationSections.filter(s => !props.type?.hiddenSections.has(s.section.name!)).filter(s => showAdditional || !props.type?.smartHiddenSections.has(s.section.name!)).filter(s => s.section.content && s.section.content.match(/\S/)).filter(s => showAdditional || !props.type?.additionalSections.has(s.name!)).map((s) => (
          <LocatableView View={TSectionViewer} className={classNames(s.section.firstSection ? 'first-section' : (s.section.additionalSection ? 'additional-section' : 'normal-section'))} callbacks={s} key={s.section.name} section={s.section} filesDict={filesDict} pureViewMode={true} navigationRoot={s} />
        ))}
      </div>
    )
  }
}
