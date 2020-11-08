import { fetchFileRange, fetchFileSize } from './FetchUtils'
import IAsyncTextReader from './IAsyncTextReader'

export default class RemoteTextReader implements IAsyncTextReader {
  constructor (private url: string, private label = 'utf-8', private buffSize = 256) { }
    private _size: Promise<number>
    private fetchedSize = 0
    private decoder = new TextDecoder(this.label)
    private _value: string = ''
    cache (): string {
      return this._value
    }

    size (): Promise<number> {
      if (!this._size) {
        this._size = fetchFileSize(this.url)
      }
      return this._size
    }

    async read (): Promise<[string, boolean]> {
      const size = await this.size()
      if (this.fetchedSize >= size) {
        return [this.decoder.decode(), true]
      }
      const buff = await fetchFileRange(this.url, this.fetchedSize, Math.min(this.fetchedSize + this.buffSize, size))
      this.fetchedSize += buff.byteLength
      const newValue = this.decoder.decode(buff, { stream: true })
      this._value += newValue
      return [newValue, this.fetchedSize >= size]
    }
}