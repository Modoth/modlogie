export default class KeyValueDbStorage<TValue> {
  constructor (private dbName:string, private storeName:string, private keyPath = 'key') {

  }

    private db: Promise<IDBDatabase>

    private async getDb (): Promise<IDBDatabase> {
      if (this.db) {
        return this.db
      }
      const createStore = (db: IDBDatabase) => {
        db.createObjectStore(this.storeName, { keyPath: this.keyPath })
      }
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(`${this.dbName}_${this.storeName}`, 1)
        request.onupgradeneeded = () => {
          createStore(request.result)
        }

        request.onsuccess = () => {
          const db = request.result
          resolve(db)
        }
        request.onblocked = (ev) => {
          reject(ev)
        }
        request.onerror = (ev) => {
          reject(ev)
        }
      })
    }

    async transaction (action: { (store: IDBObjectStore): Promise<boolean | void> | boolean | void }): Promise<void> {
      const db = await this.getDb()
      const tx = db.transaction(this.storeName, 'readwrite')
      const store = tx.objectStore(this.storeName)
      const res = await action(store)
      if (res) {
        tx.abort()
      }
      return new Promise((resolve, reject) => {
        tx.oncomplete = function () {
          resolve()
        }
        tx.onerror = (ev) => reject(ev)
      })
    }

    async query (key: string): Promise<TValue | undefined> {
      const db = await this.getDb()
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.get(key)
      return new Promise((resolve, reject) => {
        request.onsuccess = function () {
          const matching = request.result
          if (matching !== undefined) {
            resolve(matching.value)
          } else {
            resolve(undefined)
          }
        }
        request.onerror = (ev) => reject(ev)
      })
    }

    async count (): Promise<number> {
      const db = await this.getDb()
      const tx = db.transaction(this.storeName, 'readonly')
      const store = tx.objectStore(this.storeName)
      const request = store.count()
      return new Promise((resolve, reject) => {
        request.onsuccess = function () {
          resolve(request.result)
        }
        request.onerror = (ev) => reject(ev)
      })
    }
}
