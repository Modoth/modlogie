import { ILocalKeyValueStorage } from '../../domain/ServiceInterfaces/IKeyValueStorage'
import KeyValueDbStorage from '../../infrac/Web/KeyValueDbStorage'

export default class LocalKeyValueStorage<TValue> implements ILocalKeyValueStorage<TValue> {
  store = new KeyValueDbStorage<TValue>('modlite', 'blob')
  async get (key: string): Promise<TValue|undefined> {
    return await this.store.query(key)
  }

  async set (key: string, value?: TValue): Promise<void> {
    await this.store.transaction(store => {
      if (value === undefined) {
        store.delete(key)
      } else {
        store.put({ key: key, value: value })
      }
    })
  }
}
