import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResPlain.less'
import { RemoteTextReader } from '../../../../common/RemoteTextReader';
import { TextRender } from './TextRender'

export function ResPlain(props: ResFileViewerProps) {
    const blockSize = 256;
    const encoding = 'utf-8'
    const ref = React.createRef<HTMLDivElement>()
    const [reader] = useState(new RemoteTextReader(props.url, encoding, blockSize))
    const [lastTxt, setLastTxt] = useState(props.buff ? new TextDecoder(encoding).decode(new Uint8Array(props.buff, 0, blockSize), { stream: true }) : '')
    const fetchMore = async () => {
        const [txt] = await reader.read()
        setLastTxt(txt)
    }
    useEffect(() => {
        if (!props.buff) {
            fetchMore()
        }
    }, [])
    const render = (ele: HTMLDivElement | null, txt: string | undefined) => {
        if (ele && txt) {
            const render = new TextRender(ele)
            const style = window.getComputedStyle(ele)
            render.setStyle({ fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000' },)
            render.rend(txt, 0, undefined)
        }
    }
    useEffect(() => {
        render(ref.current, lastTxt)
    }, [lastTxt])
    return <div className="resplain">
        <div className="content" ref={div => render(div, lastTxt)}></div>
    </div>
}