import { FieldInfo } from '../ServiceInterfaces/IItemsExporter'
import IAnkiItemsExporter from '../ServiceInterfaces/IAnkiItemsExporter'

export default class AnkiItemsExporter implements IAnkiItemsExporter {
  get ext (): string {
    return 'anki'
  }

  async export<TItem> (items: TItem[], fields: FieldInfo<TItem>[]): Promise<ArrayBuffer> {
    const content = ''
    return new TextEncoder().encode(content).buffer
  }
}
