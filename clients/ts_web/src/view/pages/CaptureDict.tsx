import { Button } from 'antd';
import React, { useState, useEffect } from 'react'
import { useServicesLocator } from '../../app/Contexts';
import IDictService, { CancleToken, DictInfo } from '../../domain/IDictService';
import ILangsService, { LangKeys } from '../../domain/ILangsService';
import IViewService from '../services/IViewService';
import './CaptureDict.less'
import { PlusSquareOutlined, PlusOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons'

export default function CaptureDict(props: { onclose?(): void }) {
    const [word, setWord] = useState('')
    const [url, setUrl] = useState<string | undefined>()
    const [importing, setImporting] = useState(false)
    const [importProgress, setImportProgress] = useState(0)
    const [info, setInfo] = useState<DictInfo | undefined>()
    const locator = useServicesLocator()
    const langs = locator.locate(ILangsService)
    const [store] = useState<{ cancleToken?: CancleToken, importing?: boolean, mousePos?: [number, number], destoried?: boolean }>({})
    const clearLastCancleToken = () => {
        if (store.cancleToken) {
            store.cancleToken.cancled = true
            store.cancleToken = undefined
        }
    }
    const dictServer = useServicesLocator().locate(IDictService)
    const viewService = locator.locate(IViewService)
    const clearDict = async () => {
        if (!info || !info.itemCount || store.cancleToken || importing) {
            return
        }
        viewService.prompt(langs.get(LangKeys.ClearDict), [], async () => {
            if (store.cancleToken) {
                return true
            }
            viewService.setLoading(true)
            try {
                await dictServer.clean();
                if (!store.destoried) {
                    setInfo(new DictInfo(0))
                }
            } catch (e) {
                viewService!.errorKey(langs, e.message)
                return false
            }
            finally {
                viewService.setLoading(false)
            }
            return true
        })
    }
    const selectDictFile = async () => {
        if (store.cancleToken) {
            return
        }
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
                    setImportProgress(0)
                    store.importing = true
                    viewService.setLoading(true)
                    var newInfo = info;
                    try {
                        newInfo = await dictServer.change(file, store.cancleToken, (i) => {
                            if (!store.destoried) {
                                setImportProgress(i)
                            }
                        })
                    } catch (e) {
                        viewService!.errorKey(langs, e.message)
                    }
                    clearLastCancleToken()
                    store.importing = false
                    if (!store.destoried) {
                        setImporting(false)
                        setInfo(newInfo)
                    }
                    viewService.setLoading(false)
                })()
                return true
            }, false)
    }
    useEffect(() => {
        (async () => {
            store.cancleToken = { cancled: false }
            viewService.setLoading(true)
            try {
                var info = await dictServer.info(store.cancleToken)
                if (!store.destoried) {
                    setInfo(info)
                }
            }
            catch (e) {
                console.log(e)
            }
            finally {
                clearLastCancleToken()
                viewService.setLoading(false)
            }

        })()
        const handleSelected = async () => {
            const w = window.getSelection()?.toString()?.trim() || '';
            if (!w) {
                setWord(w)
                setUrl('')
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
                if (store.destoried) {
                    return
                }
                if (cancleToken === store.cancleToken) {
                    clearLastCancleToken()
                    if (url) {
                        setWord(w)
                        setUrl(url)
                    } else if (w.length > 1) {
                        // && (!w[0].match(/[a-zA-Z0-9]/)) && w[0].match(/\p{Script=Han}/u)
                        // await queryWord(w[0], w)
                        await queryWord(w.slice(0, w.length - 1), w)
                    } else {
                        setWord(origin)
                        setUrl(url)
                    }
                }
            }
            await queryWord(w, w)
        }
        const handlePosition = (ev: MouseEvent | TouchEvent) => {
            store.mousePos = ev instanceof MouseEvent ? [ev.clientX, ev.clientY] : (ev.touches[0] ? [ev.touches[0].clientX, ev.touches[0].clientY] : undefined)
        }
        document.addEventListener('mousedown', handlePosition)
        document.addEventListener('touchstart', handlePosition)
        document.addEventListener('selectionchange', handleSelected)
        document.addEventListener('touchmove', handlePosition)
        document.addEventListener('mousemove', handleSelected)
        return function cleanup() {
            store.destoried = true
            clearLastCancleToken()
            document.removeEventListener('selectionchange', handleSelected)
            document.removeEventListener('mousedown', handlePosition)
            document.removeEventListener('touchstart', handlePosition)
            document.removeEventListener('touchmove', handlePosition)
            document.removeEventListener('mousemove', handleSelected)
        };
    }, []);
    return <div className="capture-dict">
        <div className='menu'>
            {props.onclose ? <Button danger size="large" type="link" icon={<CloseOutlined />} onClick={props.onclose}></Button>
                : undefined}
            <Button type="link" >{langs.get(LangKeys.Dict)}</Button>
            <Button size="large" type="link" icon={<PlusOutlined />} onClick={() => {
                if (importing) {
                    return
                }
                selectDictFile()
            }}>{importing ? `${importProgress}%` : <span className="info">{info && info.itemCount || ''}</span>}</Button>
            <Button size="large" type="link" icon={<DeleteOutlined />} onClick={clearDict}></Button>
        </div>
        {url && store.mousePos ? <div style={{ top: store.mousePos[1] + 20 }} className='float-dict'>
            <div className="title"><Button type="link" className='word'>{word || ''}</Button></div>
            <iframe src={url} sandbox=""></iframe> </div> : undefined
        }
    </div >
} 