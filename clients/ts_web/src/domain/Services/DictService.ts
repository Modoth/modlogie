import { extname } from '../../infrac/Lang/pathutils'
import { JsonDictParser } from './DictService.JsonDictParser'
import { LangKeys } from '../ServiceInterfaces/ILangsService'
import { MdxDictParser } from './DictService.MdxDictParser'
import { TxtDictParser } from './DictService.TxtDictParser'
import IDictService, { CancleToken, DictInfo } from '../ServiceInterfaces/IDictService'
// eslint-disable-next-line import/no-webpack-loader-syntax
import style from '!!raw-loader!./DictService.css'
import KeyValueDbStorage from '../../infrac/Web/KeyValueDbStorage'

export class DictItem {
  constructor (public key: string, public value: string) { }
}

export interface DictParser {
    parse(file: File): Promise<[string, DictItem][]>
}

export default class DictService implements IDictService {
  store = new KeyValueDbStorage<string>('modlite', 'dict')
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
