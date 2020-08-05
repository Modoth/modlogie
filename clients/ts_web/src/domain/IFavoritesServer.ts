export default class IFavoritesServer {
    add(type: string, id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    has(type: string, id: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    remote(type: string, id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    get(type: string, skip?: number, take?: number): Promise<[string[], number]> {
        throw new Error('Method not implemented.')

    }

    removeAll(type: string): Promise<void> {
        throw new Error('Method not implemented.')

    }
}