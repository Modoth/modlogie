import { Word } from './IWordsStorage'

export default class IWordsExporter {
  get ext ():string {
    throw new Error('Method not implemented')
  }

  export (words:Word[]):Promise<ArrayBuffer> {
    throw new Error('Method not implemented')
  }
}
