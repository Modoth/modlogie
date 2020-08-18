export class Keyword {
    id: string;
    url: string;
    description?: string;
}

export default class IKeywordsService {
    getAll(filter?: string, skip?: number, take?: number): Promise<[number, Keyword[]]> {
        throw new Error('Method not implemented.')
    }

    add(id: string, url: string, description?: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    delete(id: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    updateUrl(id: string, url: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    updateDescription(id: string, description?: string): Promise<void> {
        throw new Error('Method not implemented.')
    }

    get(keyword: string): Promise<Keyword> {
        throw new Error('Method not implemented.')
    }
}