import ConfigKeys from '../ServiceInterfaces/ConfigKeys'
import IConfigsService from '../ServiceInterfaces/IConfigsSercice'
import IKeyValueStorageManager, { IKeyValueStorage } from '../ServiceInterfaces/IKeyValueStorage'
import IRecentFileService, { RecentFile } from '../ServiceInterfaces/IRecentFileService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default class RecentFileService extends IServicesLocator implements IRecentFileService {
    private _storage :IKeyValueStorage<RecentFile>
    get storage () {
      if (!this._storage) {
        this._storage = this.locate(IKeyValueStorageManager).get<RecentFile>(IRecentFileService)
      }
      return this._storage
    }

    private _limit:Promise<number>

    limit (): Promise<number> {
      if (!this._limit) {
        this._limit = this.locate(IConfigsService).getValueOrDefaultNumber(ConfigKeys.MAX_RECENT_FILE_SIZE)
      }
      return this._limit
    }

    getKey (group:string) {
      return `recent_files_${group}`
    }

    get (group: string): Promise<RecentFile|undefined> {
      return this.storage.get(this.getKey(group))
    }

    set (group: string, file: RecentFile|undefined): Promise<void> {
      return this.storage.set(this.getKey(group), file)
    }
}
