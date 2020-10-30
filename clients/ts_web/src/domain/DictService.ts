import IDictService, { CancleToken, DictInfo } from "./IDictService"
import style from '!!raw-loader!./DictService.css';
import localforage from "localforage";
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
        return new DictInfo(await localforage.length())
    }
    parsers = new Map<string, DictParser>([
        ['mdx', new MdxDictParser()],
        ['json', new JsonDictParser()],
    ])
    constructor() {
        localforage.config({
            driver: localforage.INDEXEDDB,
            name: 'modlite',
            version: 1.0,
            storeName: 'dict'
        });
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
        await localforage.clear()
        if (token?.cancled) {
            return new DictInfo(0)
        }

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