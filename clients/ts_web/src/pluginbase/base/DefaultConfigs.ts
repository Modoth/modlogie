import { ConfigKeysInterface } from './BaseConfigKeys'
import { Config } from '../../domain/ServiceInterfaces/IConfigsSercice'

class BlogDefaultConfigsClass implements ConfigKeysInterface<Config> {
  // BLOG_TYPES = new Config(BlogConfigKeys.BLOG_TYPES, ConfigType.STRING, "");
}

const DefaultConfigs: Config[] = Array.from(Object.values(new BlogDefaultConfigsClass()))

export default DefaultConfigs
