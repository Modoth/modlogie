import sleep from "../common/sleep"
import IDictService, { CancleToken } from "./IDictService"
import style from '!!raw-loader!./DictService.css';

export default class DictService implements IDictService {
    query(word: string, token?: CancleToken): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async queryUrl(word: string, token?: CancleToken): Promise<string> {
        await sleep(500);
        if (token && token.cancled) {
            return ''
        }
        return "data:text/html;charset=utf-8," + encodeURIComponent(`${word}<style>${style}</style>`);
    }
}