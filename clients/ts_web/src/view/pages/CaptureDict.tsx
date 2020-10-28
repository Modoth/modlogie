import React, { useState, useEffect } from 'react'
import { useServicesLocator } from '../../app/Contexts';
import IDictService, { CancleToken } from '../../domain/IDictService';
import './CaptureDict.less'

export default function CaptureDict() {
    const [word, setWord] = useState('')
    const [url, setUrl] = useState('')
    const dictServer = useServicesLocator().locate(IDictService)
    useEffect(() => {
        let lastCancleToken: CancleToken | undefined
        const handleSelected = async () => {
            const w = window.getSelection()?.toString()?.trim() || '';
            if (!w) {
                return
            }
            setWord(w)
            if (lastCancleToken) {
                lastCancleToken.cancled = true
            }
            const cancleToken: CancleToken = { cancled: false }
            lastCancleToken = cancleToken
            const url = await dictServer.queryUrl(w);
            if (cancleToken === lastCancleToken) {
                setUrl(url)
                lastCancleToken = undefined
            }
        }
        document.addEventListener('selectionchange', handleSelected)
        return function cleanup() {
            document.removeEventListener('selectionchange', handleSelected)
        };
    }, []);
    return <div className="capture-dict">
        <iframe src={url} sandbox=""></iframe>
    </div>
} 