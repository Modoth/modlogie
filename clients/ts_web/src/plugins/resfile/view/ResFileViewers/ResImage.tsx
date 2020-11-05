import React from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResImage.less'

export function ResImage(props: ResFileViewerProps) {
    const url = props.url;
    if (!url) {
        return <></>
    }
    return <div className="resimage">
        <img src={url}></img>
    </div>
}