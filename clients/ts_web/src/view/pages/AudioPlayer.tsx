import './AudioPlayer.less'
import { Button } from 'antd'
import { FileAddOutlined, CloseOutlined, PauseOutlined, CaretRightOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect, useState } from 'react'

export default function AudioPlayer () {
  const [url, setUrl] = useState('')
  const [info, setInfo] = useState({ title: '' })
  const [store] = useState({ url: '' })
  const locator = useServicesLocator()
  const [playing, setPlayging] = useState(false)
  const viewService = locator.locate(IViewService)
  const langs = locator.locate(ILangsService)
  const ref = React.createRef<HTMLAudioElement>()
  const cleanUp = () => {
    if (store.url) {
      URL.revokeObjectURL(store.url)
    }
  }
  const loadFile = (file?:File) => {
    cleanUp()
    let url = ''
    let title = ''
    if (file) {
      url = URL.createObjectURL(file)
      title = file.name
    }
    store.url = url
    setAudioSource(url)
    setUrl(url)
    setInfo({ title })
  }
  useEffect(() => cleanUp, [])
  const selectFile = () => {
    viewService.prompt(langs.get(LangKeys.Open), [{
      type: 'File',
      value: null
    //   accept: 'audio/*'
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

  const setAudioSource = (url:string|undefined) => {
    if (!ref.current) {
      return
    }
    const audio = ref.current
    audio.src = url!
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
    <audio ref={ref}></audio>
  </div>
}
