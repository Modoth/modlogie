export default class IFavoritesServer {
  setCountChangedHandler (type: string, handler: { (count: number): void }) {
    throw new Error('Method not implemented.')
  }

  unsetCountChangedHandler (type: string) {
    throw new Error('Method not implemented.')
  }

  add (type: string, id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  has (type: string, id: string): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  remove (type: string, id: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  get (type: string, skip?: number, take?: number): Promise<[string[], number]> {
    throw new Error('Method not implemented.')
  }

  count (type: string): Promise<number> {
    throw new Error('Method not implemented.')
  }

  removeAll (type: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
