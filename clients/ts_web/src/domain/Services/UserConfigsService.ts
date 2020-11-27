import IKeyValueStorageManager, { IKeyValueStorage } from '../ServiceInterfaces/IKeyValueStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IUserConfigsService from '../ServiceInterfaces/IUserConfigsService'

export default class UserConfigsService extends IServicesLocator implements IUserConfigsService {
    private _storage :IKeyValueStorage<any>
    get storage () {
      if (!this._storage) {
        this._storage = this.locate(IKeyValueStorageManager).get<any>(IUserConfigsService)
      }
      return this._storage
    }

    getKey (group:string) {
      return `user_configs_${group}`
    }

    get<TValue> (key: string): Promise<TValue | undefined> {
      return this.storage.get(this.getKey(key))
    }

    async getOrDefault<TValue> (group: string, def:TValue): Promise<TValue> {
      const res = await this.get<TValue>(group)
      return res === undefined ? def : res
    }

    set<TValue> (key: string, value?: TValue): Promise<void> {
      return this.storage.set(this.getKey(key), value)
    }
}
