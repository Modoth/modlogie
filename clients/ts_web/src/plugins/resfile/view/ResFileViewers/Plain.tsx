import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import './Plain.less'
import { Button } from 'antd';

const blockSize = 40;
const fetchFileSize = async (url: string) => {
    const res = await fetch(url, { method: "HEAD" })
    const lenStr = res.headers.get('Content-Length')
    return parseInt(lenStr || '0') || 0;
}

const fetchFileRange = async (url: string, start: number, end: number) => {
    const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } })
    const buff = await res.arrayBuffer()
    return buff;
}

export function Plain(props: ResFileViewerProps) {
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
    return <div className="plain">{size}:{fetchedSize < size ? <Button onClick={fetchMore}>获取</Button> : undefined}
        {/* <div className="content" ref={ref}> {lastTxt}</div> */}
        <div className="content" ref={ref}>useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值。在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用</div>
    </div>
}