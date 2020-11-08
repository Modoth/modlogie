import { DictParser, DictItem } from './DictService'
import { LangKeys } from '../ServiceInterfaces/ILangsService'
import pako from 'pako'
import ripemd128 from '../../infrac/thirds/ripmd128'

type DataReader = DataView & { position: number }

class KeyBlockInfo {
  constructor (public keysCount: number, public compSize: number, public decompSize: number) {
  }
}

class KeyInfo {
  constructor (public key: string, public offset: number) {
  }
}

class RecBlockInfo {
  constructor (public compSize: number, public decompSize: number) {

  }
}

export class MdxDictParser implements DictParser {
    createDataReader = (buffer: ArrayBuffer): DataReader => {
      let reader = Object.assign(new DataView(buffer), { position: 0 })
      reader.getBigUint64 = reader.getBigUint64 || ((byteOffset: number, le?: boolean) => {
        const low = reader.getUint32(byteOffset + (le ? 0 : 4), le)
        const high = reader.getUint32(byteOffset + (le ? 4 : 0), le)
        if (high) {
          throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
        }
        return low
      }) as any
      return reader
    }

    decryptBuffer = (buffer: Uint8Array, key: Uint8Array) => {
      const ripeKey = ripemd128(key)
      let byte
      let prev = 0x36
      for (let i = 0; i < buffer.length; i++) {
        byte = buffer[i]
        byte = ((byte >> 4) | (byte << 4))
        byte = byte ^ prev ^ (i & 0xFF) ^ ripeKey[i % ripeKey.length]
        prev = buffer[i]
        buffer[i] = byte
      }
      return buffer
    }

    decompAndDecryptBuffer = (reader: DataReader, compSize: number, bufferEncrypted = false): ArrayBuffer => {
      let pos = reader.position
      reader.position += compSize
      const compType = reader.getUint32(pos, true)
      pos += 4
      const checksum = new Uint8Array(reader.buffer, pos, 4)
      pos += 4
      if (compType !== 0 && compType !== 2) {
        throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
      }
      let u8s = new Uint8Array(reader.buffer, pos, reader.position - pos).map(i => i)
      if (bufferEncrypted) {
        const key = new Uint8Array(8)
        key.set(checksum)
        key.set([0x95, 0x36, 0x00, 0x00], 4)
        u8s = this.decryptBuffer(u8s, key)
      }
      if (compType === 2) {
        u8s = pako.inflate(u8s)
      }
      return u8s.buffer
    }

    readKeyBlockInfos = (buffer: ArrayBuffer, blockCount: number, _: TextDecoder, codingUnit: number): KeyBlockInfo[] => {
      const reader: DataReader = this.createDataReader(buffer)
      let blocks: KeyBlockInfo[] = []
      for (let i = 0; i < blockCount; i++) {
        const keysCount = reader.getBigUint64(reader.position)
        reader.position += 8
        const firstWordLength = codingUnit * reader.getUint16(reader.position) + 1
        reader.position += 2
        // const firstWord = decoder.decode(new Uint8Array(buffer, reader.position, firstWordLength))
        reader.position += firstWordLength
        const lastWordLength = codingUnit * reader.getUint16(reader.position) + 1
        reader.position += 2
        // const lastWord = decoder.decode(new Uint8Array(buffer, reader.position, lastWordLength))
        reader.position += lastWordLength
        const compSize = reader.getBigUint64(reader.position)
        reader.position += 8
        const decompSize = reader.getBigUint64(reader.position)
        reader.position += 8
        blocks.push(new KeyBlockInfo(Number(keysCount), Number(compSize), Number(decompSize)))
      }
      return blocks
    }

    readString (reader: DataReader, decoder: TextDecoder): string {
      const [str, len] = this.findString(reader, reader.position, decoder)
      reader.position += len
      return str
    }

    findString = (reader: DataView, start: number, decoder: TextDecoder): [string, number] => {
      let i = 0
      while (reader.getUint8(start + i)) {
        i++
      }
      const str = decoder.decode(new Uint8Array(reader.buffer, start, i))
      i++
      return [str, i]
    }

    readKeyInfos = (buffer: ArrayBuffer, keyInfosCount: number, decoder: TextDecoder): KeyInfo[] => {
      const reader: DataReader = this.createDataReader(buffer)
      let keys: KeyInfo[] = []
      for (let i = 0; i < keyInfosCount; i++) {
        const offset = reader.getBigUint64(reader.position)
        reader.position += 8
        const key = this.readString(reader, decoder)
        keys.push(new KeyInfo(key, Number(offset)))
      }
      return keys
    }

    readRecordBlockInfos = (reader: DataReader): RecBlockInfo[] => {
      let blocks: RecBlockInfo[] = []
      const recBlocksCount = reader.getBigUint64(reader.position)
      reader.position += 8
      reader.position += 8// num_entries
      reader.position += 8// index_len
      reader.position += 8// blocks_len
      for (let i = 0; i < recBlocksCount; i++) {
        const compSize = reader.getBigUint64(reader.position)
        reader.position += 8
        const decompSize = reader.getBigUint64(reader.position)
        reader.position += 8
        blocks.push(new RecBlockInfo(Number(compSize), Number(decompSize)))
      }
      return blocks
    }

    readRecordBuffer = (reader: DataReader): Uint8Array => {
      let recBlockInfos = this.readRecordBlockInfos(reader)
      const recBuffers = recBlockInfos.map(i => this.decompAndDecryptBuffer(reader, i.compSize))
      let totalCount = recBuffers.reduce((sum, value) => sum + value.byteLength, 0)
      let recBuffer = new Uint8Array(totalCount)
      let t = 0
      for (const b of recBuffers) {
        recBuffer.set(new Uint8Array(b), t)
        t += b.byteLength
      }
      return recBuffer
    }

    readInfo (reader: DataReader): Element {
      const infoLength = reader.getUint32(reader.position)
      reader.position += 4
      const infoStr = new TextDecoder('utf-16').decode(new Uint8Array(reader.buffer, reader.position, infoLength))
      reader.position += infoLength
      reader.position += 4// header checksunm
      return (new DOMParser().parseFromString(infoStr, 'text/xml')).children[0]
    }

    checkEncrypted (info: Element): boolean {
      const encrypted = parseInt(info.getAttribute('Encrypted') || '')
      const headerEncrypted = encrypted & 1
      const indexEncrypted = encrypted & 2
      if (headerEncrypted) {
        throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
      }
      return !!indexEncrypted
    }

    checkEncoding = (info: Element): [number, TextDecoder] => {
      const u8Decoder = new TextDecoder('utf-8')
      const u16Decoder = new TextDecoder('utf-16')
      const encoding = info.getAttribute('Encoding') || ''
      let codingUnit: number
      let decoder: TextDecoder
      switch (encoding.toLowerCase()) {
        case 'utf-8':
          codingUnit = 1
          decoder = u8Decoder
          break
        case 'utf-16':
          codingUnit = 2
          decoder = u16Decoder
          break
        default:
          throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
      }
      return [codingUnit, decoder]
    }

    readKeys = (reader: DataReader, indexEncrypted: boolean, decoder: TextDecoder, codingUnit: number) => {
      const blocksCount = reader.getBigUint64(reader.position)
      reader.position += 8
      // const entriesCount = reader.getBigUint64(reader.position)
      reader.position += 8
      // const keyIndexDecompLen = reader.getBigUint64(reader.position)
      reader.position += 8
      const keyIndexCompLen = reader.getBigUint64(reader.position)
      reader.position += 8
      // const keyBlockLen = reader.getBigUint64(reader.position)
      reader.position += 8
      // const keyInfoChecksum = new Uint8Array(reader.buffer, reader.position, 4)
      reader.position += 4
      const keyIndexBuffer = this.decompAndDecryptBuffer(reader, Number(keyIndexCompLen), !!indexEncrypted)
      const keyBlockInfos = this.readKeyBlockInfos(keyIndexBuffer, Number(blocksCount), decoder, codingUnit)
      const allKeys: KeyInfo[] = []
      for (const keyBlockInfo of keyBlockInfos) {
        const blockBuffer = this.decompAndDecryptBuffer(reader, keyBlockInfo.compSize)
        const keys = this.readKeyInfos(blockBuffer, keyBlockInfo.keysCount, decoder)
        allKeys.push(...keys)
      }
      return allKeys
    }

    async parse (file: File): Promise<[string, DictItem][]> {
      const reader: DataReader = this.createDataReader(await file.arrayBuffer())
      const info = this.readInfo(reader)
      if (!info) {
        throw new Error(LangKeys.MSG_ERROR_INVALID_FILE)
      }
      const indexEncrypted = this.checkEncrypted(info)
      const [codingUnit, decoder] = this.checkEncoding(info)
      const keys = this.readKeys(reader, indexEncrypted, decoder, codingUnit)
      const recordBuffer = this.readRecordBuffer(reader)
      const recbufferView = this.createDataReader(recordBuffer.buffer)
      let items: [string, DictItem][] = []
      for (const i of keys) {
        const key = i.key.trim()
        const [str] = this.findString(recbufferView, i.offset, decoder)
        items.push([key.trim(), new DictItem(key, str)])
      }
      return items
    }
}
