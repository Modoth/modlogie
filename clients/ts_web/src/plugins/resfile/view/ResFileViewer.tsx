import './ResFileViewer.less'
import { Button } from 'antd'
import { CloudDownloadOutlined, InfoCircleOutlined, FileOutlined, DownCircleOutlined, UpCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { ResFile } from '../ResFile'
import { ResFileViewerProps } from './ResFileViewers/ResFileViewerProps'
import { ResImage } from './ResFileViewers/ResImage'
import { ResPlain } from './ResFileViewers/ResPlain'
import classNames from 'classnames'
import FullscreenWraper from '../../../infrac/components/FullscreenWraper'
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'
import yaml from 'yaml'

const getViewer = (ext: string | undefined): { (props: ResFileViewerProps): JSX.Element } | undefined => {
  switch (ext?.toLocaleLowerCase()) {
    case 'txt':
    case 'json':
      return ResPlain
    case 'jpeg':
    case 'png':
    case 'jpg':
    case 'gif':
      return ResImage
    default:
  }
}

function DownloadManagerView (props: { name: string, url: string, onProgress?(progress: number): void, onFinished?(blobUrl: string): void }) {
  const [blobUrl, setBlobUrl] = useState('')
  const [buff, setBuff] = useState<ArrayBuffer | undefined>()
  const [downloadReq, setDownloadReq] = useState<XMLHttpRequest | undefined>()
  const [failed, setFailed] = useState(false)
  const [preview, setPreview] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const setDownloadProgressAndRaise = (progress: number) => {
    setDownloadProgress(progress)
    if (props.onProgress) {
      props.onProgress(progress)
    }
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
    req.onload = () => {
      const buff = req.response as ArrayBuffer
      const blob = new Blob([buff], { type: 'application/octet-stream' })
      const blobUrl = URL.createObjectURL(blob)
      setDownloadReq(undefined)
      setBlobUrl(blobUrl)
      setBuff(buff)
      if (props.onProgress) {
        props.onProgress(100)
      }
      if (props.onFinished) {
        props.onFinished(blobUrl)
      }
    }
    req.responseType = 'arraybuffer'
    req.open('GET', props.url, true)
    setFailed(false)
    if (props.onProgress) {
      props.onProgress(0)
    }
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
  const type = props.name.split('.').pop()
  const Preview = getViewer(type)
  return <>
    <div className="summary">
      <span className="progress" style={{ width: `${downloadProgress}%` }}></span>
      {
        Preview
          ? <span className="icon" onClick={() => setPreview(!preview)} >{preview ? <UpCircleOutlined /> : <DownCircleOutlined />}</span>
          : <span className="icon" ><FileOutlined /></span>
      }
      <span className="name" >{props.name}</span>
      <span className="failed">{failed ? <InfoCircleOutlined /> : ''}</span>
      {
        blobUrl ? <a download={props.name} target="_blank" rel="noreferrer" href={blobUrl}> <Button type="text" className="download" icon={<SaveOutlined />}></Button></a>
          : (downloadReq ? <Button className="download" type="text" icon={<CloseOutlined />} onClick={cancleDownload}></Button>
            : <Button type="text" className="download" icon={<CloudDownloadOutlined />} onClick={startDownload}></Button>)
      }
    </div>
    { Preview && preview ? <FullscreenWraper className="preview" View={Preview} url={blobUrl || props.url} buff={buff}></FullscreenWraper> : undefined}
  </>
}

export default function ResFileViewer (props: SectionViewerProps) {
  const resfile = yaml.parse(props.section.content) as ResFile
  const [url] = useState(props.filesDict.get(resfile?.name)?.url)
  if (!url) {
    return <></>
  }
  return <div onClick={props.onClick} className={classNames('resfile-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
    {resfile.comment ? <div className="comment"><ReactMarkdown source={resfile.comment}></ReactMarkdown></div> : undefined}
    <DownloadManagerView url={url} name={resfile.name}></DownloadManagerView>
  </div>
}
