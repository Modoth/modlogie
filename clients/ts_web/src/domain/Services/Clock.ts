import { v4 } from 'uuid'
import IClock, { ClockEvent, ClockEventListener } from '../ServiceInterfaces/IClock'
import sleep from '../../infrac/Lang/sleep'

export default class Clock implements IClock {
  id = v4()
  remain:number
  msg:any;
  started = false;
  finished = false;
  until:number
  listeners = new Map<string, Set<ClockEventListener>>()
  tick = 1000

  fireEvent (event:ClockEvent) {
    const listeners = this.listeners.get(event)
    if (listeners && listeners.size) {
      listeners.forEach(l => l(this))
    }
  }

  reset (remain:number, msg?:any) {
    this.remain = remain
    this.msg = msg
    this.started = false
    this.finished = false
    this.fireEvent('reset')
  }

  start ():void {
    if (this.started) {
      return
    }
    this.started = true
    this.fireEvent('start')
    this.run()
  }

  async run ():Promise<void> {
    this.until = Date.now() + this.remain
    while (this.remain > 0) {
      await sleep(this.tick)
      if (!this.started) {
        this.fireEvent('pause')
        return
      }
      this.remain = this.until - Date.now()
      this.fireEvent('tick')
    }
    this.finished = true
    this.started = false
    this.fireEvent('finish')
  }

  pause ():void {
    if (!this.started) {
      return
    }
    this.started = false
  }

  registerEventListener (event:ClockEvent, listener:ClockEventListener) {
    let listeners = this.listeners.get(event)
    if (!listeners) {
      listeners = new Set<ClockEventListener>()
      this.listeners.set(event, listeners)
    }
    listeners.add(listener)
  }

  removeEventListener (event:ClockEvent, listener:ClockEventListener) {
    const listeners = this.listeners.get(event)
    if (!listeners) {
      return
    }
    listeners.delete(listener)
  }
}
