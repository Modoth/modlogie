import IAudioService, { AudioEvent, AudioEventHandler } from '../Interfaces/IAudioService'

export default class AudioService implements IAudioService {
    audio = document.createElement('audio')
    events :AudioEvent[] = ['play', 'pause', 'stop', 'loaded']
    eventListeners = new Map(this.events.map(e => [e, new Set<AudioEventHandler>()]))
    fireEvent = (event:AudioEvent) => () => {
        this.eventListeners.get(event)!.forEach(h => h())
    }

    currentTitle :string|undefined
    constructor () {
      document.body.append(this.audio)
      this.audio.loop = true
      this.audio.onplay = this.fireEvent('play')
      this.audio.onpause = this.fireEvent('pause')
      this.audio.onended = this.fireEvent('stop')
      this.audio.onloadedmetadata = this.fireEvent('loaded')
    }

    load (url?: string, title?: string): void {
      if (url) {
        this.audio.src = url
      } else {
        this.audio.removeAttribute('src')
        this.audio.pause()
      }
      this.currentTitle = title
    }

    getPlay (): boolean {
      return !this.audio.paused
    }

    getTitle (): string {
      return this.audio.title || this.currentTitle || ''
    }

    play (): void {
      this.audio.play()
    }

    pause (): void {
      this.audio.pause()
    }

    registerEventListener (event: AudioEvent, callback: AudioEventHandler): void {
        this.eventListeners.get(event)!.add(callback)
    }

    removeEventListener (event: AudioEvent, callback: AudioEventHandler): void {
        this.eventListeners.get(event)!.delete(callback)
    }
}
