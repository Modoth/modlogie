import IKeyValueStorageManager, { IKeyValueStorage } from '../domain/ServiceInterfaces/IKeyValueStorage'
import IServicesLocator from '../infrac/ServiceLocator/IServicesLocator'
import IWordsStorage, { Word } from '../domain/ServiceInterfaces/IWordsStorage'

export default class WordsStorageSingleton extends IServicesLocator implements IWordsStorage {
  private _cache :Promise<Word[]>
  private _namedCache: Promise<Map<string, Word>>
  private maxWordsCount = 5000;
  private StorageKey = 'WordsStorage'
  private _storage :IKeyValueStorage<Word[]>
  get storage () {
    if (!this._storage) {
      this._storage = this.locate(IKeyValueStorageManager).get<Word[]>(IWordsStorage)
    }
    return this._storage
  }

  private getCache () {
    if (!this._cache) {
      this._cache = this.storage.get(this.StorageKey).then(words => words || [])
    }
    return this._cache
  }

  private getNamedCache () {
    if (!this._namedCache) {
      this._namedCache = this.getCache().then(words => new Map(words.map(w => [w.value, w])))
    }
    return this._namedCache
  }

  private async caches ():Promise<[Word[], Map<string, Word>] > {
    return [await this.getCache(), await this.getNamedCache()]
  }

  private async saveCache () {
    const cache = await this.getCache()
    await this.storage.set(this.StorageKey, cache)
  }

  async add (value: string, eg?: string): Promise<void> {
    const [cache, namedCache] = await this.caches()
    var existed = namedCache.get(value)
    if (existed) {
      return
    }
    const word = { value, eg, added: Date.now() }
    cache.unshift(word)
    namedCache.set(value, word)
    if (cache.length > this.maxWordsCount) {
      const remove = cache.pop()!
      namedCache.delete(remove.value)
    }
    await this.saveCache()
  }

  async existed (value: string): Promise<boolean> {
    const [_, namedCache] = await this.caches()
    var existed = namedCache.get(value)
    return !!existed
  }

  async delete (value: string): Promise<void> {
    const [cache, namedCache] = await this.caches()
    var existed = namedCache.get(value)
    if (!existed) {
      return
    }
    cache.splice(cache.indexOf(existed), 1)
    namedCache.delete(value)
    await this.saveCache()
  }

  async deleteRange (values: string[]): Promise<void> {
    if (!values || !values.length) {
      return
    }
    const [cache, namedCache] = await this.caches()
    for (const value of values) {
      var existed = namedCache.get(value)
      if (!existed) {
        continue
      }
      cache.splice(cache.indexOf(existed), 1)
      namedCache.delete(value)
    }
    await this.saveCache()
  }

  async deleteAll (): Promise<void> {
    const [cache, namedCache] = await this.caches()
    if (!cache.length) {
      return
    }
    cache.splice(0, cache.length)
    namedCache.clear()
    await this.saveCache()
  }

  async getAfter (timeFilter:number, filter?:string):Promise<Word[]> {
    let words = (await this.getCache())
    const idx = words.findIndex(w => w.added < timeFilter)
    words = ~idx ? words.slice(0, idx - 1) : words
    if (filter) {
      filter = filter.toLocaleLowerCase()
      words = words.filter(w => ~w.value.toLocaleLowerCase().indexOf(filter!))
    }
    return words.map(w => Object.assign({}, w))
  }

  async getAll (filter?:string, skip?:number, take?:number): Promise<[number, Word[]]> {
    let words = await this.getCache()
    if (filter) {
      filter = filter.toLocaleLowerCase()
      words = words.filter(w => ~w.value.toLocaleLowerCase().indexOf(filter!))
    }
    const count = words.length
    if (skip) {
      words = words.slice(skip, take && (skip + take))
    }
    return [count, words.map(w => Object.assign({}, w))]
  }
}
