import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResPlain.less'
import { RemoteTextReader } from '../../../../common/RemoteTextReader';

export function ResPlain(props: ResFileViewerProps) {
    const blockSize = 256;
    const encoding = 'utf-8'
    const [reader] = useState(new RemoteTextReader(props.url, encoding, blockSize))
    const [lastTxt, setLastTxt] = useState(props.buff ? new TextDecoder(encoding).decode(new Uint8Array(props.buff, 0, blockSize), { stream: true }) : '')
    useEffect(() => {
        if (!props.buff) {
            fetchMore()
        }
    }, [])
    const fetchMore = async () => {
        const [txt] = await reader.read()
        setLastTxt(txt)
    }
    return <div className="resplain">
        <div className="content"> {lastTxt}</div>
    </div>
}