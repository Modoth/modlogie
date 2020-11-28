export default class IKeyValueServiceBase<TValue> {
  get ():Promise<TValue|undefined> {
    throw new Error('Method not implemented.')
  }

  set (value?:TValue):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
