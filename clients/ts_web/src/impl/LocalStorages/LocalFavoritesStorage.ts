import IFavoritesStorage from '../../domain/ServiceInterfaces/IFavoritesStorage'

export default class LocalFavoritesStorage implements IFavoritesStorage {
  private FAVORITE_KEY (type: string) {
    return `favorite_articles_${type}`
  }

  async get (type: string): Promise<string[]> {
    let ids: string[] = []
    try {
      const dataStr = window.localStorage.getItem(this.FAVORITE_KEY(type))
      if (dataStr) {
        ids = JSON.parse(dataStr)
      }
    } catch (e) {
      console.log(e)
    }
    return ids
  }

  async set (type: string, value: string[]): Promise<void> {
    if (value && value.length) {
      const dataStr = JSON.stringify(value)
      window.localStorage.setItem(this.FAVORITE_KEY(type), dataStr)
    } else {
      window.localStorage.removeItem(this.FAVORITE_KEY(type))
    }
  }
}
