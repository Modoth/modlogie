import React, { useState } from 'react'
import './ResFileViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import yaml from 'yaml'
import { ResFile } from '../ResFile'
import { Plain } from './ResFileViewers/Plain'
import { ResFileViewerProps } from './ResFileViewers/ResFileViewerProps'
import { useServicesLocator } from '../../../app/Contexts'
import ILangsService, { LangKeys } from '../../../domain/ILangsService'
import { Button } from 'antd'

const getViewer = (ext: string | undefined): { (props: ResFileViewerProps): JSX.Element } | undefined => {
    switch (ext) {
        default:
            return;
    }
}

export default function ResFileViewer(props: SectionViewerProps) {
    const resfile = yaml.parse(props.section.content) as ResFile
    const langs = useServicesLocator().locate(ILangsService)
    const url = props.filesDict.get(resfile?.name)?.url
    if (!url) {
        return <></>
    }
    const type = resfile.name.split('.').pop()
    const Viewer = getViewer(type)
    return <div onClick={props.onClick} className={classNames('resfile-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <div className="summary"><span className="name" >{resfile.name}</span><a download={resfile.name} target="_blank" href={`/${url}`}>{langs.get(LangKeys.Download)}</a></div>
        {Viewer ? <div><Viewer url={url}></Viewer></div> : undefined}
    </div>
}