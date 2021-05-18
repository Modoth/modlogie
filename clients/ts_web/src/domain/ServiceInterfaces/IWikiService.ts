export interface WikiMap<K, V> {
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}

export default class IWikiService {
  getWeights (rootName: string) : Promise<WikiMap<string, number>> {
    throw new Error('Method not implemented.')
  }
}
