import BlogConfigKeys, { BlogConfigKeysInterface } from "./BlogConfigKeys";
import { Config, ConfigType } from "../../domain/IConfigsSercice";


class BlogDefaultConfigsClass implements BlogConfigKeysInterface<Config> {
    // BLOG_TYPES = new Config(BlogConfigKeys.BLOG_TYPES, ConfigType.STRING, "");
}

const BlogDefaultConfigs: Config[] = Array.from(Object.values(new BlogDefaultConfigsClass()))

export default BlogDefaultConfigs;