export interface CancleToken {
    cancled: boolean
}
export class DictInfo {
    constructor(public itemCount: number) { }
}
export default class IDictService {
    info(token?: CancleToken): Promise<DictInfo> {
        throw new Error('Method not implemented.')
    }
    change(content: string, token?: CancleToken, callBack?: { (progress: number): void }): Promise<DictInfo> {
        throw new Error('Method not implemented.')
    }
    query(word: string, token?: CancleToken): Promise<string | undefined> {
        throw new Error('Method not implemented.')
        throw new Error('Method not implemented.')
    }
    queryUrl(word: string, token?: CancleToken): Promise<string | undefined> {
        throw new Error('Method not implemented.')
    }
}