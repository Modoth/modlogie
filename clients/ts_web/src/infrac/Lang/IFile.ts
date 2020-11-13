export default interface IFile{
    name(): Promise<string>,
    size(): Promise<number>,
    read(buffSize?:number): Promise<[ArrayBuffer, boolean]>
    seek(start?:number):Promise<number>
  }

export abstract class FileBase implements IFile {
  constructor (private _name: string) {

  }

  private fetchedSize = 0

  async name (): Promise<string> {
    return this._name
  }

  async seek (start?: number): Promise<number> {
    if (!start) {
      this.fetchedSize = 0
      return this.fetchedSize
    }
    const size = await this.size()
    this.fetchedSize = Math.min(start, size)
    return this.fetchedSize
  }

    abstract size (): Promise<number> ;
    abstract getRange (start: number, buffSize?: number):Promise<ArrayBuffer>;

    async read (buffSize?:number): Promise<[ArrayBuffer, boolean]> {
      const size = await this.size()
      if (this.fetchedSize >= size || buffSize === 0) {
        return [new ArrayBuffer(0), true]
      }
      const buff = await this.getRange(this.fetchedSize,
        buffSize !== undefined
          ? Math.min(size - this.fetchedSize, buffSize) : buffSize)
      this.fetchedSize += buff.byteLength
      return [buff, this.fetchedSize >= size]
    }
}
