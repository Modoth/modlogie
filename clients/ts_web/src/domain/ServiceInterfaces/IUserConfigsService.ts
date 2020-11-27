export default class IUserConfigsService {
  get<TValue> (key:string):Promise<TValue|undefined> {
    throw new Error('Method not implemented.')
  }

  getOrDefault<TValue> (key:string, def:TValue):Promise<TValue> {
    throw new Error('Method not implemented.')
  }

  set<TValue> (key:string, value?:TValue):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
