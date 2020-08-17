import React, { useState, useEffect, memo } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo'
import { ArticleSection } from '../../../domain/Article'
import './SectionsBaseViewer.less'
import classNames from 'classnames'
import SectionViewerProps, { AdditionalSectionsViewerProps, SectionViewerCallbacks } from './SectionViewerProps'

const getSections = (allSections: Set<string>, sections?: ArticleSection[]) => {
  const existedSections = sections ? new Map(sections.map(s => [s.name!, s])) : new Map<string, ArticleSection>()
  return Array.from(allSections, (name) => existedSections.get(name) || { name, content: '' } as ArticleSection)
}

export default function SectionsBaseViewer(TSectionViewer: { (props: SectionViewerProps): JSX.Element }, viewerName: string,
  TAdditionalSectionsViewer?: { (props: AdditionalSectionsViewerProps): JSX.Element }) {
  const TAdditionalSectionsViewerMemo = TAdditionalSectionsViewer ? memo(TAdditionalSectionsViewer) : null
  return (props: ArticleContentViewerProps) => {
    const [filesDict] = useState(props.files ? new Map(props.files.map(f => [f.name!, f])) : new Map())
    const [sections] = useState((getSections(props.type?.allSections!, props.content!.sections!)))
    const [showHidden, setShowHidden] = useState(props.showHiddens == true)
    const [callbacks] = useState(new Map<string, SectionViewerCallbacks>(sections.map(s => [s.name!, {
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
      <div className={classNames(props.className, props.type?.name, viewerName, "sections-base-viewer")} onClick={(e) => {
        if (props.onClick) {
          props.onClick(e)
        }
        // else {
        //   setShowHidden(!showHidden)
        // }
      }
      }>
        {props.showTitle ? <h4 className="article-title">{props.title}</h4> : null}
        {
          TAdditionalSectionsViewerMemo ?
            <TAdditionalSectionsViewerMemo sections={sections} filesDict={filesDict} ></TAdditionalSectionsViewerMemo> :
            null
        }
        {sections.filter(s => s.content && s.content.match(/\S/)).filter(s => showHidden || !props.type?.hidenSections.has(s.name!)).map((section) => (
          <TSectionViewer callbacks={callbacks.get(section.name!)} key={section.name} section={section} filesDict={filesDict} pureViewMode={true} />
        ))}
      </div>
    )
  }
}
