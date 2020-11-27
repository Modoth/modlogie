import './AudioPlayer.less'
import { Button } from 'antd'
import { FileAddOutlined, CloseOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IRecentFileService from '../../domain/ServiceInterfaces/IRecentFileService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'

const RecentFileKey = 'AudioPlayer'

export default function AudioPlayer () {
  const [url, setUrl] = useState('')
  const [info, setInfo] = useState({ title: '' })
  const [store] = useState({ url: '' })
  const locate = useServicesLocate()
  const [playing, setPlayging] = useState(false)
  const viewService = locate(IViewService)
  const fileService = locate(IRecentFileService)
  const langs = locate(ILangsService)
  const ref = React.createRef<HTMLAudioElement>()
  const cleanUp = () => {
    if (store.url) {
      URL.revokeObjectURL(store.url)
    }
  }
  const setAudioSource = (url:string|undefined) => {
    if (!ref.current) {
      return
    }
    const audio = ref.current
    audio.src = url!
  }
  const loadFile = async (file?:File) => {
    cleanUp()
    let url = ''
    let title = ''
    await fileService.set(RecentFileKey)
    if (file) {
      url = URL.createObjectURL(file)
      title = file.name
      if (file.size > await fileService.limit()) {
      } else {
        const buff = await file.arrayBuffer()
        fileService.set(RecentFileKey, {
          name: file.name,
          type: file.type,
          size: file.size,
          buff
        })
      }
    }
    store.url = url
    setAudioSource(url)
    setUrl(url)
    setInfo({ title })
  }
  useEffect(() => {
    const loadLastFile = async () => {
      const file = await fileService.get(RecentFileKey)
      if (file) {
        const url = URL.createObjectURL(new Blob([file.buff], { type: file.type }))
        store.url = url
        setAudioSource(url)
        setUrl(url)
        setInfo({ title: file.name })
      }
    }
    loadLastFile()
    return cleanUp
  }, [])
  const selectFile = () => {
    viewService.prompt(langs.get(LangKeys.Open), [{
      type: 'File',
      value: null,
      accept: 'audio/mp3,audio/*'
    }], async (file:File) => {
      loadFile(file)
      return true
    })
  }
  const setAudioPlay = (playing:boolean) => {
    if (!ref.current) {
      return
    }
    const audio = ref.current
    if (playing) {
      audio.play()
    } else {
      audio.pause()
    }
    setPlayging(playing)
  }

  return <div className="audio-player">
    <div className="menu">
      <Button size="large" icon={<FileAddOutlined />} type="link" onClick={selectFile}>{langs.get(LangKeys.BackgroundMusic)}</Button>
      {
        url ? (playing
          ? <Button className="controls" size="large" icon={<PauseOutlined />} type="primary" shape="round" onClick={() => setAudioPlay(false)}></Button>
          : <Button className="controls" size="large" icon={<CaretRightOutlined />} type="primary" shape="round" onClick={() => setAudioPlay(true)}></Button>
        ) : undefined
      }
      <Button size="large" type="link" onClick={selectFile} className="title" >{info.title || ''}</Button>
      {url ? <Button className="controls" size="large" icon={<CloseOutlined />} danger type="link" onClick={() => loadFile()}></Button> : undefined}
    </div>
    <audio ref={ref} src={store.url || undefined} onEnded={() => setPlayging(false)} onPause={() => setPlayging(false)} onPlay={() => setPlayging(true)}></audio>
  </div>
}
