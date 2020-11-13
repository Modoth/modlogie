import IFile, { FileBase } from './IFile'

export default class BufferFile extends FileBase implements IFile {
  constructor (name:string, private buffer: ArrayBuffer) {
    super(name)
  }

  async getRange (start: number, buffSize?: number): Promise<ArrayBuffer> {
    return this.buffer.slice(start,
      buffSize === undefined
        ? this.buffer.byteLength - start
        : Math.min(start + buffSize))
  }

  async size (): Promise<number> {
    return this.buffer.byteLength
  }
}
