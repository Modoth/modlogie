export class TextReader {
  constructor (file, buffSize = 10 * 1024) {
    this.file = file
    this.buffSize = buffSize
    this.decoder = new TextDecoder(this.label)
    this._value = ''
  }

  cache () {
    return this._value
  }

  size () {
    return this.file.size()
  }

  async read () {
    const [buff, finished] = await this.file.read(this.buffSize)
    const newValue = this.decoder.decode(buff, { stream: true })
    this._value += newValue
    return [newValue, finished]
  }
}
