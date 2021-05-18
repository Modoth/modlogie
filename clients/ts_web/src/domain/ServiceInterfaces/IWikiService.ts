export interface WikiMap<K, V> {
    get(key: K): V | undefined;
    has(key: K): boolean;
    set(key: K, value: V): this;
}

// 0,1,2,3,4,5,6,7
export const WikiLevels = [6, 3, 0]

export default class IWikiService {
  getWeights (rootName: string) : Promise<WikiMap<string, number>> {
    throw new Error('Method not implemented.')
  }
}
