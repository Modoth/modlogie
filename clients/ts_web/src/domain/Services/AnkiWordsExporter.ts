import { Word } from '../ServiceInterfaces/IWordsStorage'
import IAnkiWordsExporter from '../ServiceInterfaces/IAnkiWordsExporter'

export default class AnkiWordsExporter implements IAnkiWordsExporter {
  get ext (): string {
    return 'anki'
  }

  async export (words:Word[]): Promise<ArrayBuffer> {
    const content = words.map(w => `${w.value},${w.eg || ''}`).join('\n')
    return new TextEncoder().encode(content).buffer
  }
}
