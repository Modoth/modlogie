import IKeyValueServiceBase from '../ServiceInterfaces/IKeyValueServiceBase'
import IKeyValueStorageManager, { IKeyValueStorage } from '../ServiceInterfaces/IKeyValueStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default abstract class KeyValueServiceBase<TValue> extends IServicesLocator implements IKeyValueServiceBase<TValue> {
    private _storage :IKeyValueStorage<TValue>
    abstract get key():string;
    abstract get group():object;
    get storage () {
      if (!this._storage) {
        this._storage = this.locate(IKeyValueStorageManager).get<TValue>(this.group)
      }
      return this._storage
    }

    async get (): Promise<TValue| undefined> {
      return this.storage.get(this.key)
    }

    async set (value?: TValue): Promise<void> {
      return this.storage.set(this.key, value)
    }
}
