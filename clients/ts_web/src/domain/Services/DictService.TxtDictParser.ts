import { DictParser, DictItem } from './DictService'
import { LangKeys } from '../ServiceInterfaces/ILangsService'

export class TxtDictParser implements DictParser {
  async parse (file: File): Promise<[string, DictItem][]> {
    try {
      const content = await file.text()
      const items: [string, DictItem][] = []
      for (let line of content.split('\n')) {
        line = line.trim()
        const idx = line.indexOf(' ')
        if (idx > 0) {
          const key = line.slice(0, idx)
          const value = line.slice(idx + 1).trim()
          if (!key || !value) {
            continue
          }
          const item = [key, new DictItem(key, value)] as [string, DictItem]
          items.push(item)
        }
      }
      return items
    } catch {
      throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
    }
  }
}
