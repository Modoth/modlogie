import { FieldInfo } from '../ServiceInterfaces/IItemsExporter'
import ICsvItemsExporter from '../ServiceInterfaces/ICsvItemsExporter'

const toCsvStr = (data:any) => {
  let str = String(data) as string
  str = str.replace(/"/g, '""')
  return `"${str}"`
}

const csvSplit = ','

export default class CsvItemsExporter implements ICsvItemsExporter {
  get ext (): string {
    return 'csv'
  }

  async export<TItem> (name:string, items: TItem[], fields: FieldInfo<TItem>[]): Promise<ArrayBuffer> {
    const content = fields.map(f => f.name).join(csvSplit) +
    '\n' +
    items.map(w => fields.map(f => toCsvStr(f.get(w))).join(csvSplit)).join('\n')
    console.log(content)
    return new (TextEncoder as any)().encode(content).buffer
  }
}
