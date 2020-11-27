import IKeyValueStorageManager, { IKeyValueStorage, ILocalKeyValueStorage, IRemoteKeyValueStorage } from '../ServiceInterfaces/IKeyValueStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export interface KeyValueStorageInfo{
  group:object;
  name:string;
  remote?:boolean
}

export default class KeyValueStorageManager extends IServicesLocator implements IKeyValueStorageManager {
  infos:Map<object, KeyValueStorageInfo>

  constructor (infos: KeyValueStorageInfo[]) {
    super()
    this.infos = new Map(infos.map(i => [i.group, i]))
  }

  get<TValue> (group: object): IKeyValueStorage<TValue> {
    const info = this.infos.get(group)
    if (!info) {
      throw new Error('Group not registed.')
    }
    const type = info.remote ? IRemoteKeyValueStorage : ILocalKeyValueStorage
    return this.locate(type)
  }
}
