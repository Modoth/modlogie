export type AudioEvent = 'play' | 'pause' | 'stop'

export type AudioEventHandler =()=>void

export default class IAudioService {
  load (url?:string) {
    throw new Error('Method not implemented.')
  }

  play () {
    throw new Error('Method not implemented.')
  }

  pause () {
    throw new Error('Method not implemented.')
  }

  registerEventListener (event:AudioEvent, callback:AudioEventHandler) {
    throw new Error('Method not implemented.')
  }

  removeEventListener (event:AudioEvent, callback:AudioEventHandler) {
    throw new Error('Method not implemented.')
  }
}
