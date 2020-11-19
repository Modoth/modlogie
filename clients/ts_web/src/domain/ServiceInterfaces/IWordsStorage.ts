export interface Word{
    value:string;
    eg?:string;
    added: number
}

export default class IWordsStorage {
  add (value:string, eg?:string):Promise<void> {
    throw new Error('Method not imolemented.')
  }

  existed (value:string) :Promise<boolean> {
    throw new Error('Method not imolemented.')
  }

  delete (value:string) :Promise<void> {
    throw new Error('Method not imolemented.')
  }

  deleteRange (values:string[]):Promise<void> {
    throw new Error('Method not imolemented.')
  }

  deleteAll ():Promise<void> {
    throw new Error('Method not imolemented.')
  }

  getAfter (time:number, filter?:string):Promise<Word[]> {
    throw new Error('Method not imolemented.')
  }

  getAll (filter?:string, skip?:number, take?:number):Promise<[number, Word[]]> {
    throw new Error('Method not imolemented.')
  }
}
