import IUserBlobStorage from '../../domain/ServiceInterfaces/IUserBlobStorage'

const getStorageKey = (path:string) => `blob_${path}`

export default class LocalUserBlobStorage implements IUserBlobStorage {
  async add (path: string, blob: any): Promise<void> {
    localStorage.setItem(getStorageKey(path), JSON.stringify(blob))
  }

  async get (path: string): Promise<any> {
    const str = localStorage.getItem(getStorageKey(path))
    if (!str) {
      return undefined
    }
    try {
      const blob = JSON.parse(str)
      return blob
    } catch (e) {
      console.log('Invalid stored data.', e)
      throw e
    }
  }
}
