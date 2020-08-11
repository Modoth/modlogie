import IFavoritesServer from "./IFavoritesServer"
import IServicesLocator from "../common/IServicesLocator";
import IFavoritesStorage from "./IFavoritesStorage";
import IConfigsService from "./IConfigsSercice";
import ConfigKeys from "../app/ConfigKeys";
import { LangKeys } from "./ILangsService";

export default class FavoritesServerSingleton extends IServicesLocator implements IFavoritesServer {
    private _favorites: Map<string, [string[], Set<string>]> = new Map();
    private _handlers: Map<string, { (count: number): void }> = new Map();
    private async getTypeFavorites(type: string): Promise<[string[], Set<string>]> {
        if (!this._favorites.has(type)) {
            var storage = this.locate(IFavoritesStorage);
            var fav = await storage.get(type);
            this._favorites.set(type, [fav, new Set(fav)]);
        }
        return this._favorites.get(type)!;
    }
    async add(type: string, id: string): Promise<void> {
        var [ids, idsSet] = await this.getTypeFavorites(type);
        if (idsSet.has(id)) {
            return;
        }
        if (ids.length > await this.locate(IConfigsService).getValueOrDefaultNumber(ConfigKeys.MAX_FAVORITES_PER_TYPE)) {
            throw new Error(LangKeys.BeyondMaxFavorites);
        }
        idsSet.add(id);
        ids.unshift(id);
        await this.locate(IFavoritesStorage).set(type, ids);
        this._handlers.get(type)?.call(null, ids.length)
    }

    async has(type: string, id: string): Promise<boolean> {
        var [_, idsSet] = await this.getTypeFavorites(type);
        return idsSet.has(id);
    }

    async remove(type: string, id: string): Promise<void> {
        var [ids, idsSet] = await this.getTypeFavorites(type);
        if (!idsSet.has(id)) {
            return;
        }
        idsSet.delete(id);
        ids.splice(ids.indexOf(id), 1)
        await this.locate(IFavoritesStorage).set(type, ids);
        this._handlers.get(type)?.call(null, ids.length)
    }

    async get(type: string, skip?: number, take?: number): Promise<[string[], number]> {
        var [ids] = await this.getTypeFavorites(type);
        var res = ids;
        var start = skip || 0;
        var end = take ? start + take : undefined
        res = ids.slice(start, end)
        return [res, ids.length]
    }

    async count(type: string): Promise<number> {
        var [ids] = await this.getTypeFavorites(type);
        return ids.length;
    }

    async removeAll(type: string): Promise<void> {
        this._favorites.set(type, [[], new Set()])
        await this.locate(IFavoritesStorage).set(type, []);
        this._handlers.get(type)?.call(null, 0)

    }

    setCountChangedHandler(type: string, handler: { (count: number): void }) {
        this._handlers.set(type, handler);
    }
    unsetCountChangedHandler(type: string) {
        this._handlers.delete(type);
    }
}