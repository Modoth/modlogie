import React, { useEffect, useState } from 'react'
import { ResFileViewerProps } from './ResFileViewerProps'
import { fetchFileRange, fetchFileSize } from './common';
import './ResImage.less'
const blockSize = 10 * 1024;

export function ResImage(props: ResFileViewerProps) {
    const [size, setSize] = useState(0)
    const [url, setUrl] = useState<string | undefined>()
    const [store] = useState({} as any)
    useEffect(() => {
        fetchFileSize(props.url).then(setSize)
        return () => {
            if (store.url) {
                URL.revokeObjectURL(store.url)
            }
        }
    }, [])
    useEffect(() => {
        if (!size) {
            return
        }
        (async () => {
            if (store.url) {
                URL.revokeObjectURL(store.url)
            }
            const buff = await fetchFileRange(props.url, 0, Math.min(blockSize, size))
            const blob = new Blob([buff], { type: 'image/*' })
            store.url = URL.createObjectURL(blob)
            setUrl(store.url)
        })()
    }, [size])
    if (!url) {
        return <></>
    }
    return <div className="resimage">
        <img src={url}></img>
    </div>
}