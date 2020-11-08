import React, { useState, useEffect, memo } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo'
import { ArticleSection } from '../../../domain/ServiceInterfaces/Article'
import './BaseViewer.less'
import classNames from 'classnames'
import SectionViewerProps, { AdditionalSectionViewerProps } from './SectionViewerProps'
import LocatableView, { LocatableViewCallbacks } from '../../../view/components/LocatableView'

export interface ArticleSectionVm extends ArticleSection {
  additionalSection?: boolean;
  firstSection?: boolean;
}

const getSections = (allSections: Set<string>, additionalSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  let s = Array.from(allSections, (name) => Object.assign(existedSections.get(name) || { name, content: '' }, { additionalSection: additionalSections && additionalSections.has(name) }) as ArticleSectionVm)
  if (s[0]) {
    s[0].firstSection = true;
  }
  return s;
}

export default function BaseViewer(TSectionViewer: { (props: SectionViewerProps): JSX.Element }, pluginName: string,
  TAdditionalSectionsViewer?: { (props: AdditionalSectionViewerProps): JSX.Element }) {
  const TAdditionalSectionsViewerMemo = TAdditionalSectionsViewer ? memo(TAdditionalSectionsViewer) : null
  return (props: ArticleContentViewerProps) => {
    const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
    const [sections] = useState((getSections(props.type?.allSections!, props.type?.additionalSections!, props.content?.sections || [])))
    const [showAdditional] = useState(props.showAdditionals == true)
    const [callbacks] = useState(new Map<string, LocatableViewCallbacks>(sections.map(s => [s.name!, {
      onfocus: () => {
        if (props.viewerCallbacks?.onSection) {
          props.viewerCallbacks!.onSection!(s.name!)
        }
      }
    }])))
    useEffect(() => {
      if (props.viewerCallbacks) {
        if (props.viewerCallbacks.onSections) {
          props.viewerCallbacks.onSections(sections!.map(s => s.name!).filter(s => callbacks.get(s)?.focus));
        }
        props.viewerCallbacks.gotoSection = s => {
          if (callbacks.has(s)) {
            callbacks.get(s)!.focus!()
          }
        }
      }
    }, [sections])
    return (
      <div className={classNames(props.className, props.type?.name, pluginName, "base-viewer")} onClick={(e) => {
        if (props.onClick) {
          props.onClick(e)
        }
      }
      }>
        {props.showTitle ? <h4 className="article-title">{props.title}</h4> : null}
        {props.published ? <span className="published-date">{props.published.toLocaleDateString()}</span> : null}
        {props.tags && props.tags.length ? props.tags.map(t => <span key={t.name}></span>) : null}
        {
          TAdditionalSectionsViewerMemo ?
            <TAdditionalSectionsViewerMemo sections={sections} filesDict={filesDict} ></TAdditionalSectionsViewerMemo> :
            null
        }
        {sections.filter(s => !props.type?.hiddenSections.has(s.name!)).filter(s => showAdditional || !props.type?.smartHiddenSections.has(s.name!)).filter(s => s.content && s.content.match(/\S/)).filter(s => showAdditional || !props.type?.additionalSections.has(s.name!)).map((section) => (
          <LocatableView View={TSectionViewer} className={classNames(section.firstSection ? 'first-section' : (section.additionalSection ? 'additional-section' : 'normal-section'))} callbacks={callbacks.get(section.name!)} key={section.name} section={section} filesDict={filesDict} pureViewMode={true} />
        ))}
      </div>
    )
  }
}
