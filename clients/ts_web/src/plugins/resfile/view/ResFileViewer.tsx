import './ResFileViewer.less'
import { Button } from 'antd'
import { CloudDownloadOutlined, InfoCircleOutlined, FileOutlined, DownCircleOutlined, UpCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons'
import { extname } from '../../../infrac/Lang/pathutils'
import { FullscreenWrap } from '../../../infrac/components/FullscreenWraper'
import { ResExternal } from './ResFileViewers/ResExternal'
import { ResFile } from '../ResFile'
import { ResFileViewerProps } from './ResFileViewers/ResFileViewerProps'
import { ResImage } from './ResFileViewers/ResImage'
import { useServicesLocate } from '../../../view/common/Contexts'
import classNames from 'classnames'
import IEditorsService from '../../../app/Interfaces/IEditorsService'
import Markdown from '../../../infrac/components/Markdown'
import React, { useEffect, useState } from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'
import yaml from 'yaml'

const ResImageFullscreen = FullscreenWrap(ResImage)

const getViewer = async (editorService :IEditorsService, ext: string): Promise<{ (props: ResFileViewerProps): JSX.Element } | undefined> => {
  switch (ext?.toLocaleLowerCase()) {
    case 'jpeg':
    case 'png':
    case 'jpg':
    case 'gif':
      return ResImageFullscreen
    default:
      if (await editorService.getViewerByFileName(ext)) {
        return ResExternal
      }
  }
}

function DownloadManagerView (props: { name: string, url: string, onProgress?(progress: number): void, onFinished?(blobUrl: string): void }) {
  const [blobUrl, setBlobUrl] = useState('')
  const [buff, setBuff] = useState<ArrayBuffer | undefined>()
  const [downloadReq, setDownloadReq] = useState<XMLHttpRequest | undefined>()
  const [failed, setFailed] = useState(false)
  const [preview, setPreview] = useState(false)
  const locate = useServicesLocate()
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [PreviewView, setPreviewView] = useState<{view:{(props: ResFileViewerProps): JSX.Element } |undefined}>()
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
    const editorService = locate(IEditorsService)
    const type = extname(props.name)

    getViewer(editorService, type || props.name).then(view => {
      if (view) {
        setPreviewView({ view })
      }
    })
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
  const Preview = PreviewView?.view
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
    { Preview && preview ? <div className="preview"><Preview name={props.name} url={blobUrl || props.url} buff={buff}></Preview></div> : undefined}
  </>
}

export default function ResFileViewer (props: SectionViewerProps) {
  const resfile = yaml.parse(props.section.content) as ResFile
  const [url] = useState(()=>props.filesDict.get(resfile?.name)?.url)
  if (!url) {
    return <></>
  }
  return <div onClick={props.onClick} className={classNames('resfile-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
    {resfile.comment ? <div className="comment"><Markdown source={resfile.comment}></Markdown></div> : undefined}
    <DownloadManagerView url={url} name={resfile.name}></DownloadManagerView>
  </div>
}
