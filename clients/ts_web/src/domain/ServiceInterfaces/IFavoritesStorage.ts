export default class IFavoritesStorage {
  get (type: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  set (type: string, value: string[]): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
