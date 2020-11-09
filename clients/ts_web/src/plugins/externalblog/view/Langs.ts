import { ConfigKeysInterface } from './Configs'
import IKeyValue from '../../../infrac/Image/IKeyValue'

class LangsClass implements ConfigKeysInterface<string>, IKeyValue {
    [key: string]: string
    BASE_ADD = '基础地址'
}

const Langs = new LangsClass()

export default Langs
