import IClocksService, { ClockInfo } from '../ServiceInterfaces/IClocksStorage'
import IKeyValueStorageManager, { IKeyValueStorage } from '../ServiceInterfaces/IKeyValueStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default class ClocksService extends IServicesLocator implements IClocksService {
  private _storage :IKeyValueStorage<ClockInfo[]>
  key = 'clocks'
  get storage () {
    if (!this._storage) {
      this._storage = this.locate(IKeyValueStorageManager).get<ClockInfo[]>(IClocksService)
    }
    return this._storage
  }

  async load (): Promise<ClockInfo[] | undefined> {
    return this.storage.get(this.key)
  }

  async save (clocks?: ClockInfo[]): Promise<void> {
    return this.storage.set(this.key, clocks)
  }
}
