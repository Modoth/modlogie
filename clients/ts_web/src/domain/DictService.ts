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
        return new DictInfo(await this.store.length())
    }
    parsers = new Map<string, DictParser>([
        ['mdx', new MdxDictParser()],
        ['json', new JsonDictParser()],
    ])
    store = localforage.createInstance({ name: 'dict' })
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
        await this.store.clear()
        if (token?.cancled) {
            return new DictInfo(0)
        }
        const total = items.length;
        let progress = 0;
        for (var i = 0; i < total; i++) {
            var item = items[i][1];
            await this.store.setItem(item.key, item.value)
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
        return new DictInfo(await this.store.length())
    }
    async query(word: string, token?: CancleToken): Promise<string | undefined> {
        return await this.store.getItem(word) || undefined;
    }
    async queryUrl(word: string, token?: CancleToken): Promise<string | undefined> {
        if (token && token.cancled) {
            return ''
        }
        var value = await this.store.getItem(word)
        return value && "data:text/html;charset=utf-8," + encodeURIComponent(`${value}<style>${style}</style>`);
    }
}