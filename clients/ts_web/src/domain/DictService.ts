import sleep from "../common/sleep"
import IDictService, { CancleToken, DictInfo } from "./IDictService"
import style from '!!raw-loader!./DictService.css';
import localforage from "localforage";

class Item {
    constructor(public key: string, public value: string) { }
}

export default class DictService implements IDictService {
    async info(token?: CancleToken): Promise<DictInfo> {
        return new DictInfo(await localforage.length())
    }
    constructor() {
        localforage.config({
            driver: localforage.INDEXEDDB,
            name: 'modlite',
            version: 1.0,
            storeName: 'dict'
        });
    }
    parseDict(content: string): [string, Item][] {
        try {
            var json: string[][] = JSON.parse(content)
            return json.filter(i => i[0]).map(i => {
                var key = i.shift()!
                return [key, new Item(key, i.join(''))] as [string, Item]
            })
        }
        catch (e) {
            console.log(e)
            return []
        }
    }
    async change(content: string, token?: CancleToken, callBack?: { (progress: number): void }): Promise<DictInfo> {
        await localforage.clear()
        if (token?.cancled) {
            return new DictInfo(0)
        }
        var items = this.parseDict(content)
        const total = items.length;
        let progress = 0;
        for (var i = 0; i < total; i++) {
            var item = items[i][1];
            await localforage.setItem(item.key, item.value)
            if (token?.cancled) {
                return new DictInfo(0)
            }
            if (callBack) {
                let newProgress = Math.floor((i * 100 / total))
                if (newProgress != progress) {
                    progress = newProgress
                    callBack(progress)
                }
            }
        }
        return new DictInfo(await localforage.length())
    }
    async query(word: string, token?: CancleToken): Promise<string | undefined> {
        return await localforage.getItem(word) || undefined;
    }
    async queryUrl(word: string, token?: CancleToken): Promise<string | undefined> {
        if (token && token.cancled) {
            return ''
        }
        var value = await localforage.getItem(word)
        return value && "data:text/html;charset=utf-8," + encodeURIComponent(`${value}<style>${style}</style>`);
    }
}