import IHistoryService, { HistoryItem, IHistoryStorage } from '../ServiceInterfaces/IHistoryService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import KeyValueServiceBase from './KeyValueServiceBase'

export class HistoryStorage extends KeyValueServiceBase<HistoryItem[]> implements IHistoryStorage {
  get key (): string {
    return 'history'
  }

  get group (): object {
    return IHistoryStorage
  }
}

export default class HistoryServiceSingleton extends IServicesLocator implements IHistoryService {
  private _items: Promise<HistoryItem[]>
  private maxItemCount = 7
  private get items () {
    if (!this._items) {
      this._items = this.locate(IHistoryStorage).get().then(items => items || [])
    }
    return this._items
  }

  async saveItems ():Promise<void> {
    this.locate(IHistoryStorage).set(await this.items)
  }

  async all (): Promise<HistoryItem[]> {
    const items = await this.items
    return Array.from(items, i => Object.assign({}, i))
  }

  async clear (): Promise<void> {
    const items = await this.items
    if (items.length) {
      items.splice(0, items.length)
    }
    this.saveItems()
  }

  async add (url:string, title:string, fixed?:boolean):Promise<void> {
    const items = await this.items
    const idx = items.findIndex(i => i.url === url)
    if (~idx) {
      items.splice(idx, 1)
    }
    items.unshift({ url, title, fixed })
    while (items.length > this.maxItemCount) {
      items.pop()
    }
    this.saveItems()
  }

  async updateFixed (url:string, fixed?:boolean) {
    const items = await this.items
    const item = items.find(i => i.url === url)
    if (!item) {
      throw new Error('Not Found.')
    }
    item.fixed = fixed
    this.saveItems()
  }

  async delete (url:string):Promise<void> {
    const items = await this.items
    const idx = items.findIndex(i => i.url === url)
    if (~idx) {
      items.splice(idx, 1)
      this.saveItems()
    }
  }
}
