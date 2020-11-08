import { LangKeys } from '../ServiceInterfaces/ILangsService'
import ConfigKeys from '../ServiceInterfaces/ConfigKeys'
import IConfigsService from '../ServiceInterfaces/IConfigsSercice'
import IFavoritesServer from '../ServiceInterfaces/IFavoritesServer'
import IFavoritesStorage from '../ServiceInterfaces/IFavoritesStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default class FavoritesServerSingleton extends IServicesLocator implements IFavoritesServer {
    private _favorites: Map<string, [string[], Set<string>]> = new Map();
    private _handlers: Map<string, { (count: number): void }> = new Map();
    private async getTypeFavorites (type: string): Promise<[string[], Set<string>]> {
      if (!this._favorites.has(type)) {
        const storage = this.locate(IFavoritesStorage)
        const fav = await storage.get(type)
        this._favorites.set(type, [fav, new Set(fav)])
      }
      return this._favorites.get(type)!
    }

    async add (type: string, id: string): Promise<void> {
      const [ids, idsSet] = await this.getTypeFavorites(type)
      if (idsSet.has(id)) {
        return
      }
      if (ids.length > await this.locate(IConfigsService).getValueOrDefaultNumber(ConfigKeys.MAX_FAVORITES_PER_TYPE)) {
        throw new Error(LangKeys.BeyondMaxFavorites)
      }
      idsSet.add(id)
      ids.unshift(id)
      await this.locate(IFavoritesStorage).set(type, ids)
      const hander = this._handlers.get(type)
      if (hander) {
        hander(ids.length)
      }
    }

    async has (type: string, id: string): Promise<boolean> {
      const [_, idsSet] = await this.getTypeFavorites(type)
      return idsSet.has(id)
    }

    async remove (type: string, id: string): Promise<void> {
      const [ids, idsSet] = await this.getTypeFavorites(type)
      if (!idsSet.has(id)) {
        return
      }
      idsSet.delete(id)
      ids.splice(ids.indexOf(id), 1)
      await this.locate(IFavoritesStorage).set(type, ids)
      const hander = this._handlers.get(type)
      if (hander) {
        hander(ids.length)
      }
    }

    async get (type: string, skip?: number, take?: number): Promise<[string[], number]> {
      const [ids] = await this.getTypeFavorites(type)
      let res = ids
      const start = skip || 0
      const end = take ? start + take : undefined
      res = ids.slice(start, end)
      return [res, ids.length]
    }

    async count (type: string): Promise<number> {
      const [ids] = await this.getTypeFavorites(type)
      return ids.length
    }

    async removeAll (type: string): Promise<void> {
      this._favorites.set(type, [[], new Set()])
      await this.locate(IFavoritesStorage).set(type, [])
      const hander = this._handlers.get(type)
      if (hander) {
        hander(0)
      }
    }

    setCountChangedHandler (type: string, handler: { (count: number): void }) {
      this._handlers.set(type, handler)
    }

    unsetCountChangedHandler (type: string) {
      this._handlers.delete(type)
    }
}
