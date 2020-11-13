import IFile, { FileBase } from './IFile'

export default class WebFile extends FileBase implements IFile {
  private reader :FileReader
  private waitings:{needed:number, resolve():void}[] = []
  constructor (private file: File) {
    super(file.name)
    this.reader = new FileReader()
    this.reader.onprogress = (ev) => {
      const loaded = ev.loaded
      const idx = this.waitings.findIndex(w => w.needed > loaded)
      if (idx === 0) {
        return
      }
      const waiteds = this.waitings.splice(0, idx > 0 ? idx : this.waitings.length)
      waiteds.forEach(r => r.resolve())
    }
    this.reader.readAsArrayBuffer(file)
  }

  async getRange (start: number, buffSize?: number): Promise<ArrayBuffer> {
    const needed = buffSize === undefined
      ? this.file.size - start
      : Math.min(start + buffSize)
    const buffer = this.reader.result as ArrayBuffer
    if (buffer && buffer.byteLength >= needed) {
      return buffer.slice(start, needed)
    }
    return new Promise(resolve => {
      const waiting = { resolve, needed }
      const idx = this.waitings.findIndex(w => w.needed > needed)
      if (idx === 0) {
        this.waitings.unshift(waiting)
      } else if (idx < 0) {
        this.waitings.push(waiting)
      } else {
        this.waitings.splice(idx - 1, 0, waiting)
      }
    }).then(() => {
      const buffer = this.reader.result as ArrayBuffer
      return buffer.slice(start, needed)
    })
  }

  async size (): Promise<number> {
    return this.file.size
  }
}
