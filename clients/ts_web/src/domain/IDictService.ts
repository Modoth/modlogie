export interface CancleToken {
    cancled: boolean
}
export default class IDictService {
    query(word: string, token?: CancleToken): Promise<string> {
        throw new Error('Method not implemented.')
    }
    queryUrl(word: string, token?: CancleToken): Promise<string> {
        throw new Error('Method not implemented.')
    }
}