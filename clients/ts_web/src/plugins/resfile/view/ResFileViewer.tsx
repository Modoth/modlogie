import React, { useEffect, useState } from 'react'
import './ResFileViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../base/view/SectionViewerProps'
import yaml from 'yaml'
import { ResFile } from '../ResFile'
import { ResPlain } from './ResFileViewers/ResPlain'
import { ResFileViewerProps } from './ResFileViewers/ResFileViewerProps'
import { CloudDownloadOutlined, InfoCircleOutlined, FileOutlined, DownOutlined, UpOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import ReactMarkdown from 'react-markdown'
import { ResImage } from './ResFileViewers/ResImage'
import { Button } from 'antd'
import { finished } from 'stream'

const getViewer = (ext: string | undefined): { (props: ResFileViewerProps): JSX.Element } | undefined => {
    switch (ext?.toLocaleLowerCase()) {
        case 'txt':
        case 'mdx':
        case 'json':
            return ResPlain;
        case 'jpeg':
        // return ResImage;
        default:
            return
    }
}

function Downloader(props: { name: string, url: string, onProgress?(progress: number): void, onFinished?(blobUrl: string): void }) {
    const [blobUrl, setBlobUrl] = useState('')
    const [downloadReq, setDownloadReq] = useState<XMLHttpRequest | undefined>()
    const [failed, setFailed] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const setDownloadProgressAndRaise = (progress: number) => {
        setDownloadProgress(progress)
        props.onProgress?.(progress)
    }
    const cancleDownload = () => {
        if (downloadReq) {
            downloadReq.abort()
            setDownloadReq(undefined)
            setDownloadProgressAndRaise(0)
        }
    }
    const startDownload = () => {
        const req = new XMLHttpRequest()
        req.onprogress = (ev) => {
            const newProgress = ev.total && Math.floor(ev.loaded * 100 / ev.total)
            if (newProgress > downloadProgress) {
                setDownloadProgressAndRaise(newProgress)
            }
        }
        req.onerror = () => setFailed(true)
        req.onload = (ev) => {
            const buff = req.response as ArrayBuffer
            const blob = new Blob([buff], { type: 'application/octet-stream' });
            const blobUrl = URL.createObjectURL(blob);
            setDownloadReq(undefined)
            setBlobUrl(blobUrl)
            props.onProgress?.(100)
            props.onFinished?.(blobUrl)
        }
        req.responseType = "arraybuffer";
        req.open("GET", props.url, true)
        setFailed(false)
        props.onProgress?.(0)
        setDownloadReq(req)
    }

    useEffect(() => {
        if (downloadReq) {
            downloadReq.send()
        }
    }, [downloadReq])

    useEffect(() => {
        return () => {
            if (downloadReq) {
                downloadReq.onload = null
                downloadReq.onerror = null
                downloadReq.onprogress = null
                downloadReq.abort()
            }
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl)
            }
        }
    }, [])
    return <><span className="name" >{props.name}</span><span className="failed">{failed ? <InfoCircleOutlined /> : ''}</span>
        {
            blobUrl ? <a className="download" download={props.name} target="_blank" href={blobUrl}><SaveOutlined /></a>
                :
                (downloadReq ? <Button type="text" icon={<CloseOutlined />} onClick={cancleDownload}></Button> :
                    <Button type="text" icon={<CloudDownloadOutlined />} onClick={startDownload}></Button>)
        }
    </>
}

export default function ResFileViewer(props: SectionViewerProps) {
    const resfile = yaml.parse(props.section.content) as ResFile
    const [preview, setPreview] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [url] = useState(props.filesDict.get(resfile?.name)?.url)
    const [previewUrl, setPreviewUrl] = useState(url)
    if (!url) {
        return <></>
    }
    const type = resfile.name.split('.').pop()
    const Viewer = getViewer(type)
    return <div onClick={props.onClick} className={classNames('resfile-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        {resfile.comment ? <div className="comment"><ReactMarkdown source={resfile.comment}></ReactMarkdown></div> : undefined}
        <div className="summary">
            <span className="progress" style={{ width: `${downloadProgress}%` }}></span>
            <span className="icon" onClick={() => {
                if (Viewer) {
                    setPreview(!preview)
                }
            }} >{!Viewer ? <FileOutlined /> : (preview ? <UpOutlined /> : <DownOutlined />)}</span>
            <Downloader url={url} name={resfile.name} onFinished={setPreviewUrl} onProgress={setDownloadProgress}></Downloader>
        </div>
        {Viewer && preview ? <div className="preview"><Viewer url={url}></Viewer></div> : undefined}
    </div>
}