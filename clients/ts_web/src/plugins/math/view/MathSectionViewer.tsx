import './MathSectionViewer.less'
import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import { ArticleSlice, getSlices, SliceType, SliceFile } from './Slice'
import ArticleFileViewer from '../../../view/pages/ArticleFileViewer'
import classNames from 'classnames'
import Latex from '../../../infrac/components/Latex'
import React, { useState } from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'

class ArticleSectionVm {
    slices: ArticleSlice[] = [];

    constructor (
        public name: string,
        section: string,
        files?: Map<string, ArticleFile>
    ) {
      this.slices = getSlices(section, files)
    }
}

const renderSlice = (slice: ArticleSlice, onClick?: any) => {
  switch (slice.type) {
    case SliceType.Inline:
    case SliceType.Block:
      if (typeof slice.content === 'object') {
        const file = slice.content as SliceFile
        return <ArticleFileViewer onClick={onClick} className="section-content" key={slice.id} file={file.file}></ArticleFileViewer>
      }
      return (
        <Latex key={slice.id}
          className="section-content"
          inline={slice.type === SliceType.Inline}
          content={slice.content as string}
        ></Latex>
      )
    default:
      return <span key={slice.id} className="section-content slice-content">{slice.content}</span>
  }
}

export default function MathSectionViewer (props: SectionViewerProps) {
  const [section] = useState(() => new ArticleSectionVm(props.section.name!, props.section.content || '', props.filesDict))
  return <div onClick={props.onClick} className={classNames('math-section-viewer', section.name, props.pureViewMode ? 'view-mode' : 'edit-mode')} key={section.name}>
    <label className="section-name">{section.name}</label>
    {section.slices.map((slice) => renderSlice(slice, props.onClick))}
  </div>
}
