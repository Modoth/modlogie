import { useServicesLocate } from '../common/Contexts'
import IAudioService, { AudioEvent, AudioEventHandler } from '../../app/Interfaces/IAudioService'
import React from 'react'

export default function AudioServiceView () {
  const locate = useServicesLocate()
  const audioService = locate(IAudioService)
  return <audio ref={audio => {
    if (!audio) {
      return
    }
    const events :AudioEvent[] = ['play', 'pause', 'stop']
    const eventListeners = new Map(events.map(e => [e, new Set<AudioEventHandler>()]))
    const fireEvent = (event:AudioEvent) => () => {
        eventListeners.get(event)!.forEach(h => h())
    }
    audioService.registerEventListener = (event, callback) => {
        eventListeners.get(event)!.add(callback)
    }
    audioService.removeEventListener = (event, callback) => {
        eventListeners.get(event)!.delete(callback)
    }
    audioService.load = (url:string|undefined) => {
      if (url) {
        audio.src = url
      } else {
        audio.removeAttribute('src')
        audio.pause()
      }
    }
    audioService.play = () => {
      audio.play()
    }
    audioService.pause = () => {
      audio.pause()
    }
    audio.onplay = fireEvent('play')
    audio.onpause = fireEvent('pause')
    audio.onended = fireEvent('stop')
  }} ></audio>
}
