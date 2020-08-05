import SectionsBaseConfigKeys, { SectionsBaseConfigKeysInterface } from "./SectionsBaseConfigKeys";
import { Config, ConfigType } from "../../domain/IConfigsSercice";


class BlogDefaultConfigsClass implements SectionsBaseConfigKeysInterface<Config> {
    // BLOG_TYPES = new Config(BlogConfigKeys.BLOG_TYPES, ConfigType.STRING, "");
}

const SectionsBaseDefaultConfigs: Config[] = Array.from(Object.values(new BlogDefaultConfigsClass()))

export default SectionsBaseDefaultConfigs;