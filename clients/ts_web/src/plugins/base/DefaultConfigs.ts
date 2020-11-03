import BaseConfigKeys, { ConfigKeysInterface } from "./BaseConfigKeys";
import { Config, ConfigType } from "../../domain/IConfigsSercice";


class BlogDefaultConfigsClass implements ConfigKeysInterface<Config> {
    // BLOG_TYPES = new Config(BlogConfigKeys.BLOG_TYPES, ConfigType.STRING, "");
}

const DefaultConfigs: Config[] = Array.from(Object.values(new BlogDefaultConfigsClass()))

export default DefaultConfigs;