import { extname } from '../../infrac/Lang/pathutils'
import { JsonDictParser } from './DictService.JsonDictParser'
import { LangKeys } from '../ServiceInterfaces/ILangsService'
import { MdxDictParser } from './DictService.MdxDictParser'
import { TxtDictParser } from './DictService.TxtDictParser'
import IDictService, { CancleToken, DictInfo } from '../ServiceInterfaces/IDictService'
// eslint-disable-next-line import/no-webpack-loader-syntax
import style from '!!raw-loader!./DictService.css'

export class DictItem {
  constructor (public key: string, public value: string) { }
}

export interface DictParser {
    parse(file: File): Promise<[string, DictItem][]>
}

class DataStore {
  constructor (private storeName:string, private keyPath = 'key') {

  }

  private dbName = 'modlite'

  private db: Promise<IDBDatabase>

  private async getDb (): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }
    const createStore = (db: IDBDatabase) => {
      db.createObjectStore(this.storeName, { keyPath: this.keyPath })
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
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

  async query (key: string): Promise<string | undefined> {
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

export default class DictService implements IDictService {
  store = new DataStore('dict')
  async info (token?: CancleToken): Promise<DictInfo> {
    return new DictInfo(await this.store.count())
  }

    parsers = new Map<string, DictParser>([
      ['mdx', new MdxDictParser()],
      ['json', new JsonDictParser()],
      ['txt', new TxtDictParser()]
    ])

    async parseDict (file: File): Promise<[string, DictItem][]> {
      const type = extname(file.name)
      if (!type || !this.parsers.has(type)) {
        throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
      }
      const parser = this.parsers.get(type)!
      return await parser?.parse(file)
    }

    async clean (): Promise<void> {
      await this.store.transaction(store => {
        store.clear()
      })
    }

    async change (file: File, token?: CancleToken, callBack?: { (progress: number): void }): Promise<DictInfo> {
      const items = await this.parseDict(file)
      if (token?.cancled) {
        return new DictInfo(0)
      }
      if (token?.cancled) {
        return new DictInfo(0)
      }
      const total = items.length
      const perBulk = Math.ceil(total / 100)
      for (let progress = 0; progress < 100; progress++) {
        const offset = perBulk * progress
        const remain = total - offset
        if (remain <= 0) {
          break
        }
        if (token?.cancled) {
          break
        }
        await this.store.transaction(store => {
          for (let i = 0; i < perBulk && i < remain; i++) {
            const idx = i + offset
            const item = items[idx][1]
            store.put({ key: item.key, value: item.value })
            if (token?.cancled) {
              return true
            }
            if (callBack) {
              callBack(progress)
            }
          }
        })
      }

      return new DictInfo(await this.store.count())
    }

    async query (word: string, token?: CancleToken): Promise<string | undefined> {
      return await this.store.query(word) || undefined
    }

    async queryUrl (word: string, token?: CancleToken): Promise<string | undefined> {
      if (token && token.cancled) {
        return ''
      }
      const value = await this.store.query(word)
      return value && 'data:text/html;charset=utf-8,' + encodeURIComponent(`${value}<style>${style}</style>`)
    }
}
