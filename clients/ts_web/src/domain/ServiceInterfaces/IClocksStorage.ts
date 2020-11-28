export type ClockInfo = { msg?:any}&({ until:number;}|{remain:number;})

export default class IClocksService {
  load ():Promise<ClockInfo[]|undefined> {
    throw new Error('Method not implemented.')
  }

  save (clocks?:ClockInfo[]):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
