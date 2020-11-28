import './AudioPlayer.less'
import { Button } from 'antd'
import { FileAddOutlined, CloseOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../common/Contexts'
import IAudioService from '../../app/Interfaces/IAudioService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IRecentFileService from '../../domain/ServiceInterfaces/IRecentFileService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'

const RecentFileKey = 'AudioPlayer'

export default function AudioPlayer () {
  const locate = useServicesLocate()

  const viewService = locate(IViewService)
  const fileService = locate(IRecentFileService)
  const audioService = locate(IAudioService)
  const langs = locate(ILangsService)
  const [info, setInfo] = useState({ title: audioService.getTitle() })
  const [store] = useState({ url: '' })
  const [playing, setPlayging] = useState(audioService.getPlay())
  const [hasData, setHasData] = useState(!!info.title || playing)
  const releaseAudioSource = () => {
    if (store.url) {
      URL.revokeObjectURL(store.url)
    }
  }
  const loadFile = async (file?:File) => {
    releaseAudioSource()
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
    audioService.load(url, file?.name)
    setInfo({ title: file?.name || '' })
    setHasData(!!url)
  }
  useEffect(() => {
    const onPlay = () => setAudioPlay(true)
    const onPause = () => setAudioPlay(false)
    const onStop = () => setAudioPlay(false)
    const onLoaded = () => {
      const title = audioService.getTitle()
      setInfo({ title })
    }
    audioService.registerEventListener('play', onPlay)
    audioService.registerEventListener('pause', onPause)
    audioService.registerEventListener('stop', onStop)
    audioService.registerEventListener('loaded', onLoaded)
    const loadLastFile = async () => {
      const file = await fileService.get(RecentFileKey)
      if (file) {
        const url = URL.createObjectURL(new Blob([file.buff], { type: file.type }))
        store.url = url
        audioService.load(url, file.name)
        setHasData(!!url)
        setInfo({ title: file.name })
      }
    }
    if (!hasData) {
      loadLastFile()
    }
    return () => {
      audioService.removeEventListener('play', onPlay)
      audioService.removeEventListener('pause', onPause)
      audioService.removeEventListener('stop', onStop)
      audioService.removeEventListener('loaded', onLoaded)
      releaseAudioSource()
    }
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
    if (playing) {
      audioService.play()
    } else {
      audioService.pause()
    }
    setPlayging(playing)
  }

  return <div className="audio-player">
    <Button size="large" icon={<FileAddOutlined />} type="link" onClick={selectFile}>{langs.get(LangKeys.BackgroundMusic)}</Button>
    {
      hasData ? (playing
        ? <Button className="controls" size="large" icon={<PauseOutlined />} type="primary" shape="round" onClick={() => setAudioPlay(false)}></Button>
        : <Button className="controls" size="large" icon={<CaretRightOutlined />} type="primary" shape="round" onClick={() => setAudioPlay(true)}></Button>
      ) : undefined
    }
    <Button size="large" type="link" onClick={selectFile} className="title" >{info.title || ''}</Button>
    {hasData ? <Button className="controls" size="large" icon={<CloseOutlined />} danger type="link" onClick={() => loadFile()}></Button> : undefined}
  </div>
}
