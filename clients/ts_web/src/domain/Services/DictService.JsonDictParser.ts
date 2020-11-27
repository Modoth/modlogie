import { DictParser, DictItem } from './DictService'
import { LangKeys } from '../ServiceInterfaces/ILangsService'

export class JsonDictParser implements DictParser {
  async parse (file: File): Promise< DictItem[]> {
    try {
      const content = await file.text()
      const json: string[][] = JSON.parse(content)
      return json.filter(i => i[0]).map(i => {
        const key = i.shift()!
        return new DictItem(key, i.join(''))
      })
    } catch {
      throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
    }
  }
}
