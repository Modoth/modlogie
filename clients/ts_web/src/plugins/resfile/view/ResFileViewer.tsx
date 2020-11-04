import React, { useState } from 'react'
import './ResFileViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import yaml from 'yaml'
import { ResFile } from '../ResFile'
import { ResPlain } from './ResFileViewers/ResPlain'
import { ResFileViewerProps } from './ResFileViewers/ResFileViewerProps'
import { DownloadOutlined, FileOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { ResImage } from './ResFileViewers/ResImage'

const getViewer = (ext: string | undefined): { (props: ResFileViewerProps): JSX.Element } | undefined => {
    switch (ext?.toLocaleLowerCase()) {
        case 'txt':
        case 'mdx':
        case 'json':
            return ResPlain;
        case 'jpeg':
        // return ResImage;
        default:
            return
    }
}

export default function ResFileViewer(props: SectionViewerProps) {
    const resfile = yaml.parse(props.section.content) as ResFile
    const ref = React.createRef<HTMLAnchorElement>()
    const [preview, setPreview] = useState(false)
    const url = props.filesDict.get(resfile?.name)?.url
    if (!url) {
        return <></>
    }
    const type = resfile.name.split('.').pop()
    const Viewer = getViewer(type)
    return <div onClick={props.onClick} className={classNames('resfile-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        {resfile.comment ? <div className="comment"><ReactMarkdown source={resfile.comment}></ReactMarkdown></div> : undefined}
        <div className="summary"><span className="icon" onClick={() => {
            if (Viewer) {
                setPreview(!preview)
            }
        }} >{!Viewer ? <FileOutlined /> : (preview ? <UpOutlined /> : <DownOutlined />)}</span>
            <span className="name" >{resfile.name}</span>
            <a ref={ref} className="download" download={resfile.name} target="_blank" href={`/${url}`}><DownloadOutlined /></a>
        </div>
        {Viewer && preview ? <div className="preview"><Viewer url={url}></Viewer></div> : undefined}
    </div>
}