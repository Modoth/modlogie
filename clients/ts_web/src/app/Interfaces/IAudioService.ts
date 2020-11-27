export type AudioEvent = 'play' | 'pause' | 'stop' | 'loaded'

export type AudioEventHandler =()=>void

export default class IAudioService {
  load (url?:string, title?:string) {
    throw new Error('Method not implemented.')
  }

  getPlay ():boolean {
    throw new Error('Method not implemented.')
  }

  getTitle ():string {
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
