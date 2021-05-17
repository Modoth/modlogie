import { Anki, AnkiTemplate } from '../../infrac/thirds/Anki'
import { FieldInfo } from '../ServiceInterfaces/IItemsExporter'
import IAnkiItemsExporter from '../ServiceInterfaces/IAnkiItemsExporter'

function generateField<TItem> (item:TItem, field:FieldInfo<TItem>):string|undefined {
  const fieldContent = String(field.get(item))
  if(!fieldContent){
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
    if (fields.length) {
      const frontField = fields.shift()!
      for (const item of items) {
        const front = generateField(item, frontField)
        if(!front){
          continue
        }
        const back = fields.map(field => generateField(item, field)).filter(i => i).join('</br>')
        exporter.addCard(front, back)
      }
    }
    const buffer = await exporter.export() as ArrayBuffer
    return buffer
  }
}
