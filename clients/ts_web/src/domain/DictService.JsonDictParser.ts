import { DictParser, DictItem } from "./DictService"
import { LangKeys } from "./ILangsService"

export class JsonDictParser implements DictParser {
    async parse(file: File): Promise<[string, DictItem][]> {
        try {
            var content = await file.text()
            var json: string[][] = JSON.parse(content)
            return json.filter(i => i[0]).map(i => {
                var key = i.shift()!
                return [key, new DictItem(key, i.join(''))] as [string, DictItem]
            })
        } catch {
            throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
        }
    }
}