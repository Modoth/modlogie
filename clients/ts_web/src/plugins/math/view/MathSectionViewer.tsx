import React, { useState } from 'react'
import { ArticleFile } from '../../../domain/Article'
import ArticleFileViewer from '../../../view/components/ArticleFileViewer'
import './MathSectionViewer.less'
import classNames from 'classnames'
import { ArticleSlice, getSlices, SliceType, SliceFile } from './Slice'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import Latex from '../../base/common/Latex'

class ArticleSectionVm {
    public slices: ArticleSlice[] = [];

    constructor(
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

export default function MathSectionViewer(props: SectionViewerProps) {
    const [section] = useState(new ArticleSectionVm(props.section.name!, props.section.content || '', props.filesDict))
    return <div onClick={props.onClick} className={classNames('math-section-viewer', section.name, props.pureViewMode ? 'view-mode' : 'edit-mode')} key={section.name}>
        <label className="section-name">{section.name}</label>
        {section.slices.map((slice) => renderSlice(slice, props.onClick))}
    </div>
}