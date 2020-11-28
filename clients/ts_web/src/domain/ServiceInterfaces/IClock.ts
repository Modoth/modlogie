export type ClockEvent = 'reset'| 'start' | 'pause' | 'tick'| 'finish'
export type ClockEventListener = (clock:IClock)=>void

export default class IClock {
  get id ():string {
    throw new Error('Method not implemented.')
  }

  get until ():number {
    throw new Error('Method not implemented.')
  }

  get remain ():number {
    throw new Error('Method not implemented.')
  }

  get msg ():any {
    throw new Error('Method not implemented.')
  }

  get started ():boolean {
    throw new Error('Method not implemented.')
  }

  get finished ():boolean {
    throw new Error('Method not implemented.')
  }

  reset (remain:number, msg?:any) {
    throw new Error('Method not implemented.')
  }

  start ():void {
    throw new Error('Method not implemented.')
  }

  pause ():void {
    throw new Error('Method not implemented.')
  }

  registerEventListener (event:ClockEvent, listener:ClockEventListener) {
    throw new Error('Method not implemented.')
  }

  removeEventListener (event:ClockEvent, listener:ClockEventListener) {
    throw new Error('Method not implemented.')
  }
}
