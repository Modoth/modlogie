import { Button } from 'antd';
import React, { useState, useEffect } from 'react'
import { useServicesLocator } from '../../app/Contexts';
import IDictService, { CancleToken, DictInfo } from '../../domain/IDictService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
import IViewService from '../services/IViewService';
import './CaptureDict.less'
import { PlusSquareOutlined } from '@ant-design/icons'

export default function CaptureDict() {
    const [word, setWord] = useState('')
    const [url, setUrl] = useState<string | undefined>()
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [info, setInfo] = useState<DictInfo | undefined>()
    const locator = useServicesLocator()
    const langs = locator.locate(ILangsService)
    const [store] = useState<{ cancleToken?: CancleToken, importing?: boolean }>({})
    const clearLastCancleToken = () => {
        if (store.cancleToken) {
            store.cancleToken.cancled = true
            store.cancleToken = undefined
        }
    }
    const dictServer = useServicesLocator().locate(IDictService)
    const selectDictFile = async () => {
        if (store.cancleToken) {
            return
        }
        const viewService = locator.locate(IViewService)
        viewService.prompt(
            langs.get(LangKeys.Import),
            [
                {
                    type: 'File',
                    value: null,
                }
            ],
            async (file: File) => {
                (async () => {
                    store.cancleToken = { cancled: false }
                    setImporting(true)
                    store.importing = true
                    viewService.setLoading(true)
                    var newInfo = info;
                    try {
                        newInfo = await dictServer.change(file, store.cancleToken, setImportProgress)
                    } catch (e) {
                        viewService!.errorKey(langs, e.message)
                    }
                    clearLastCancleToken()
                    store.importing = false
                    setImporting(false)
                    setInfo(newInfo)
                    viewService.setLoading(false)
                })()
                return true
            }, false)
    }
    useEffect(() => {
        (async () => {
            store.cancleToken = { cancled: false }
            var info = await dictServer.info(store.cancleToken)
            clearLastCancleToken()
            setInfo(info)
        })()
        const handleSelected = async () => {
            const w = window.getSelection()?.toString()?.trim() || '';
            if (!w) {
                return
            }
            if (store.importing) {
                return
            }
            const queryWord = async (w: string, origin: string) => {
                clearLastCancleToken()
                const cancleToken: CancleToken = { cancled: false }
                store.cancleToken = cancleToken

                const url = await dictServer.queryUrl(w.toLowerCase());
                if (cancleToken === store.cancleToken) {
                    clearLastCancleToken()
                    if (url) {
                        setWord(w)
                        setUrl(url)
                    } else if (w.length > 1 && (!w[0].match(/[a-zA-Z0-9]/)) && w[0].match(/\p{Script=Han}/u)) {
                        await queryWord(w[0], w)
                    } else {
                        setWord(origin)
                        setUrl(url)
                    }
                }
            }
            await queryWord(w, w)
        }
        document.addEventListener('selectionchange', handleSelected)
        return function cleanup() {
            clearLastCancleToken()
            document.removeEventListener('selectionchange', handleSelected)
        };
    }, []);
    return <div className="capture-dict">
        {url ? <iframe src={url} sandbox=""></iframe> : <div className='menu'><Button type="link" icon={<PlusSquareOutlined />} onClick={selectDictFile}><span className="info">{importing ? `${importProgress}%` : (info && info.itemCount || 0)}</span></Button><Button type="link" className='word'></Button></div>}
    </div>
} 