import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResPlain.less'
import { fetchFileRange, fetchFileSize } from './common';
const blockSize = 256;

export function ResPlain(props: ResFileViewerProps) {
    const [size, setSize] = useState(0)
    const [fetchedSize, setFetchedSize] = useState(0)
    const [lastBuff, setLastBuff] = useState<ArrayBuffer | undefined>()
    const [decoder] = useState(new TextDecoder('utf-8'));
    const [lastTxt, setLastTxt] = useState(props.buff ? decoder.decode(new Uint8Array(props.buff, 0, blockSize), { stream: true }) : '')
    const ref = React.createRef<HTMLDivElement>()
    useEffect(() => {
        if (!props.buff) {
            fetchFileSize(props.url).then(setSize)
        }
    }, [])
    useEffect(() => {
        if (!size || props.buff) {
            return
        }
        fetchMore()
    }, [size])
    useEffect(() => {
        if (!ref.current) {
            return
        }
        console.log(ref.current)
        console.log(ref.current.innerText.length)
    })
    const fetchMore = async () => {
        if (fetchedSize >= size) {
            decoder.decode()
            return
        }
        const buff = await fetchFileRange(props.url, fetchedSize, Math.min(fetchedSize + blockSize, size))
        setFetchedSize(buff.byteLength + fetchedSize)
        setLastBuff(buff)
        setLastTxt(decoder.decode(buff, { stream: true }))
    }
    return <div className="resplain">
        <div className="content"> {lastTxt}</div>
    </div>
}