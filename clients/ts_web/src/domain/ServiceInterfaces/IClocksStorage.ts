import IKeyValueServiceBase from './IKeyValueServiceBase'

export type ClockInfo = { msg?:any}&({ until:number;}|{remain:number;})

export default class IClocksService extends IKeyValueServiceBase<ClockInfo[]> {

}
