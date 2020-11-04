import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './ResPlain.less'
import { fetchFileRange, fetchFileSize } from './common';
const blockSize = 256;

export function ResPlain(props: ResFileViewerProps) {
    const [size, setSize] = useState(0)
    const [fetchedSize, setFetchedSize] = useState(0)
    const [lastBuff, setLastBuff] = useState<ArrayBuffer | undefined>()
    const [lastTxt, setLastTxt] = useState('')
    const [decoder] = useState(new TextDecoder('utf-8'));
    const ref = React.createRef<HTMLDivElement>()
    useEffect(() => {
        fetchFileSize(props.url).then(setSize)
    }, [])
    useEffect(() => {
        if (!size) {
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