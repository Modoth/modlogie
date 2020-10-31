import IDictService, { CancleToken, DictInfo } from "./IDictService"
import style from '!!raw-loader!./DictService.css';
import { LangKeys } from "./ILangsService";
import { MdxDictParser } from "./DictService.MdxDictParser";

export class Item {
    constructor(public key: string, public value: string) { }
}

export interface DictParser {
    parse(file: File): Promise<[string, Item][]>
}

class JsonDictParser implements DictParser {
    async parse(file: File): Promise<[string, Item][]> {
        var content = await file.text()
        var json: string[][] = JSON.parse(content)
        return json.filter(i => i[0]).map(i => {
            var key = i.shift()!
            return [key, new Item(key, i.join(''))] as [string, Item]
        })
    }
}

export default class DictService implements IDictService {
    async info(token?: CancleToken): Promise<DictInfo> {
        return new DictInfo(await this.countStore())
    }
    parsers = new Map<string, DictParser>([
        ['mdx', new MdxDictParser()],
        ['json', new JsonDictParser()],
    ])

    private _db: Promise<IDBDatabase>
    private _dbName = 'modlite'
    private _storeName = 'dict'
    async getDb(): Promise<IDBDatabase> {
        if (this._db) {
            return this._db
        }
        const createStore = (db: IDBDatabase) => {
            db.createObjectStore(this._storeName, { keyPath: "key" });
        }
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this._dbName, 1);
            request.onupgradeneeded = () => {
                createStore(request.result)
            };

            request.onsuccess = () => {
                const db = request.result;
                resolve(db)
            };
            request.onblocked = (ev) => {
                reject(ev)
            }
            request.onerror = (ev) => {
                reject(ev)
            }
        })
    }

    async bulkStore(action: { (store: IDBObjectStore): Promise<boolean | void> | boolean | void }): Promise<void> {
        const db = await this.getDb()
        const tx = db.transaction(this._storeName, "readwrite");
        const store = tx.objectStore(this._storeName);
        var res = await action(store)
        if (res) {
            tx.abort()
        }
        return new Promise((resolve, reject) => {
            tx.oncomplete = function () {
                resolve()
            };
            tx.onerror = (ev) => reject(ev)
        })
    }

    async queryStore(key: string): Promise<string | undefined> {
        const db = await this.getDb()
        const tx = db.transaction(this._storeName, "readonly");
        const store = tx.objectStore(this._storeName);
        const request = store.get(key);
        return new Promise((resolve, reject) => {
            request.onsuccess = function () {
                var matching = request.result;
                if (matching !== undefined) {
                    resolve(matching.value);
                } else {
                    resolve(undefined);
                }
            };
            request.onerror = (ev) => reject(ev)
        })
    }
    async countStore(): Promise<number> {
        const db = await this.getDb()
        const tx = db.transaction(this._storeName, "readonly");
        const store = tx.objectStore(this._storeName);
        const request = store.count()
        return new Promise((resolve, reject) => {
            request.onsuccess = function () {
                resolve(request.result)
            };
            request.onerror = (ev) => reject(ev)
        })
    }

    async parseDict(file: File): Promise<[string, Item][]> {
        var type = file.name.split('.').pop()
        if (!type || !this.parsers.has(type)) {
            throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
        }
        var parser = this.parsers.get(type)!
        return await parser?.parse(file)
    }
    async change(file: File, token?: CancleToken, callBack?: { (progress: number): void }): Promise<DictInfo> {
        var items = await this.parseDict(file)
        if (token?.cancled) {
            return new DictInfo(0)
        }
        await this.bulkStore(store => {
            store.clear()
        })
        if (token?.cancled) {
            return new DictInfo(0)
        }
        const total = items.length;
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
            await this.bulkStore(store => {
                for (let i = 0; i < perBulk && i < remain; i++) {
                    let idx = i + offset
                    var item = items[idx][1];
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



        return new DictInfo(await this.countStore())
    }
    async query(word: string, token?: CancleToken): Promise<string | undefined> {
        return await this.queryStore(word) || undefined;
    }
    async queryUrl(word: string, token?: CancleToken): Promise<string | undefined> {
        if (token && token.cancled) {
            return ''
        }
        var value = await this.queryStore(word)
        return value && "data:text/html;charset=utf-8," + encodeURIComponent(`${value}<style>${style}</style>`);
    }
}