import { Word } from '../ServiceInterfaces/IWordsStorage'
import ICsvWordsExporter from '../ServiceInterfaces/ICsvWordsExporter'

export default class CsvWordsExporter implements ICsvWordsExporter {
  get ext (): string {
    return 'csv'
  }

  async export (words:Word[]): Promise<ArrayBuffer> {
    const content = words.map(w => `${w.value},${w.eg || ''}`).join('\n')
    return new TextEncoder().encode(content).buffer
  }
}
