import React, { useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResPlain.less'
import RemoteTextReader from '../../../../common/RemoteTextReader';
import TextArea from '../../../../view/components/TextArea';

export function ResPlain(props: ResFileViewerProps) {
    const blockSize = 10 * 1024;
    const encoding = 'utf-8'
    const [reader] = useState(props.buff ? undefined : new RemoteTextReader(props.url, encoding, blockSize))
    const [text] = useState(props.buff ? new TextDecoder(encoding).decode(new Uint8Array(props.buff), { stream: true }) : '')
    return <div className="resplain">
        <TextArea value={props.buff ? text : reader!}></TextArea>
    </div>
}