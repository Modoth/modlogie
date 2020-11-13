import { fetchFileRange, fetchFileSize } from './FetchUtils'
import IFile, { FileBase } from './IFile'

export default class RemoteFile extends FileBase implements IFile {
  constructor (name:string, private url: string, private buffSize = 256) {
    super(name)
  }

  private _size: Promise<number>

  size (): Promise<number> {
    if (!this._size) {
      this._size = fetchFileSize(this.url)
    }
    return this._size
  }

  async getRange (start: number, buffSize?: number): Promise<ArrayBuffer> {
    return fetchFileRange(this.url, start, start + (buffSize === undefined ? this.buffSize : buffSize))
  }
}
