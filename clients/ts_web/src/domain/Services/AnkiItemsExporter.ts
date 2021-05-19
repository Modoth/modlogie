import { Anki, AnkiTemplate } from '../../infrac/thirds/Anki'
import { ExportResource, FieldInfo } from '../ServiceInterfaces/IItemsExporter'
import IAnkiItemsExporter from '../ServiceInterfaces/IAnkiItemsExporter'

function generateField<TItem> (item:TItem, field:FieldInfo<TItem>, resources: ExportResource[]):string|undefined {
  const [fieldContent, r] = field.get(item)
  if (r && r.length) {
    resources.push(...r)
  }
  if (!fieldContent) {
    return undefined
  }
  return `<div class="${field.name}">${fieldContent}</div>`
}
export default class AnkiItemsExporter implements IAnkiItemsExporter {
  get ext (): string {
    return 'apkg'
  }

  async export<TItem> (name:string, items: TItem[], fields: FieldInfo<TItem>[], data:AnkiTemplate): Promise<ArrayBuffer> {
    const exporter = new Anki()
    const template = data as AnkiTemplate
    await exporter.init(name, template)
    const resources: ExportResource[] = []
    if (fields.length) {
      for (const item of items) {
        const front = fields.filter(f => f.front).map(field => generateField(item, field, resources)).filter(i => i).join('</br>')
        if (!front) {
          continue
        }
        const back = fields.filter(f => !f.front).map(field => generateField(item, field, resources)).filter(i => i).join('</br>')
        exporter.addCard(front, back)
      }
    }
    for (const r of resources) {
      const data = await (await fetch(r.path)).arrayBuffer()
      exporter.addMedia(r.name, data)
    }
    const buffer = await exporter.export() as ArrayBuffer
    return buffer
  }
}
