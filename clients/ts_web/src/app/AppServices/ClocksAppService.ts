import IClock from '../../domain/ServiceInterfaces/IClock'
import IClocksAppService from '../Interfaces/IClocksAppService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../Interfaces/IViewService'
import IClocksService, { ClockInfo } from '../../domain/ServiceInterfaces/IClocksStorage'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'

export default class ClocksAppService extends IServicesLocator implements IClocksAppService {
  private clocks : Promise<IClock[]>

  private registerClock (clock:IClock) {
    clock.registerEventListener('finish', this.onClockFinished)
    clock.registerEventListener('reset', this.saveClocks)
    clock.registerEventListener('finish', this.saveClocks)
    clock.registerEventListener('start', this.saveClocks)
    clock.registerEventListener('pause', this.saveClocks)
  }

  private removeClock (clock:IClock) {
    clock.registerEventListener('finish', this.onClockFinished)
    clock.removeEventListener('reset', this.saveClocks)
    clock.removeEventListener('finish', this.saveClocks)
    clock.removeEventListener('start', this.saveClocks)
    clock.removeEventListener('pause', this.saveClocks)
  }

  saveClocksCancleToken:{cancled?:boolean}|undefined

  private async saveClocksInternal (cancleToken:{cancled?:boolean}) {
    this.saveClocksCancleToken = cancleToken
    const checkCancled = () => this.saveClocksCancleToken !== cancleToken || cancleToken.cancled
    const clocks:ClockInfo[ ] = []
    for (const c of await this.clocks) {
      if (checkCancled()) {
        return
      }
      if (c.finished) {
        continue
      }
      const clock :ClockInfo = c.started ? { until: Date.now() + c.remain } : { remain: c.remain }
      clock.msg = c.msg
      clocks.push(clock)
    }
    const clocksService = this.locate(IClocksService)
    await clocksService.set(clocks)
    if (checkCancled()) {
      return
    }
    this.saveClocksCancleToken = undefined
  }

  saveClocks = async () => {
    if (this.saveClocksCancleToken) {
      this.saveClocksCancleToken.cancled = true
    }
    this.saveClocksInternal({})
  }

  async loadClocks () :Promise<[IClock[], ClockInfo[]]> {
    const clocksService = this.locate(IClocksService)
    const clocks :IClock[] = []
    const finishedClocks:ClockInfo[] = []
    const infos = await clocksService.get()
    if (infos && infos.length) {
      for (const c of infos) {
        const clock = this.locate(IClock)
        if ('remain' in c) {
          clock.reset(c.remain, c.msg)
        } else {
          const remain = c.until - Date.now()
          if (remain <= 0) {
            finishedClocks.push(c)
            continue
          }
          clock.reset(remain, c.msg)
          clock.start()
        }
        clocks.push(clock)
      }
    }
    return [clocks, finishedClocks]
  }

   onClockFinished = (clock:IClock) => {
     this.promptClocksFinished(clock)
   }

   promptClocksFinished (...clocks:ClockInfo[]) {
     const viewService = this.locate(IViewService)
     const langs = this.locate(ILangsService)
     const title = clocks.map(clock => `${'until' in clock
     ? new Date(clock.until).toLocaleTimeString()
    : new Date().toLocaleTimeString()} ${clock.msg || ''}`).join('\n')
     viewService.prompt(title, [
     ], async () => true)
   }

   async init ():Promise<void> {
     const [clocks, finishedClocks] = await this.loadClocks()
     this.clocks = Promise.resolve(clocks)
     if (finishedClocks && finishedClocks.length) {
       const earliest = Date.now() - 24 * 60 * 60 * 1000
       this.promptClocksFinished(...finishedClocks.filter(c => 'until' in c && c.until > earliest))
       await this.saveClocks()
     }
     clocks.forEach(c => this.registerClock(c))
   }

   async all ():Promise<IClock[]> {
     const clocks = await this.clocks
     return Array.from(clocks)
   }

   async add (remain:number, msg?:any):Promise<IClock> {
     const clocks = await this.clocks
     const clock = this.locate(IClock)
     clock.reset(remain, msg)
     clocks.push(clock)
     this.registerClock(clock)
     this.saveClocks()
     return clock
   }

   async remove (clock:IClock):Promise<void> {
     const clocks = await this.clocks
     const idx = clocks.indexOf(clock)
     if (~idx) {
       clocks.splice(idx, 1)
       this.removeClock(clock)
       this.registerClock(clock)
     }
   }
}
