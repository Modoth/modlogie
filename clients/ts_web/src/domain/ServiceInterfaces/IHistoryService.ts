import IKeyValueServiceBase from './IKeyValueServiceBase'

export interface HistoryItem{
    url:string;
    title:string;
    fixed?:boolean;
}

export class IHistoryStorage extends IKeyValueServiceBase<HistoryItem[]> {

}

export default class IHistoryService {
  all ():Promise<HistoryItem[]> {
    throw new Error('Method not implemented.')
  }

  clear ():Promise<void> {
    throw new Error('Method not implemented.')
  }

  add (url:string, title:string, fixed?:boolean):Promise<void> {
    throw new Error('Method not implemented.')
  }

  updateFixed (url:string, fixed?:boolean) {
    throw new Error('Method not implemented.')
  }

  delete (url:string):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
