
export class BlogConfigKeysInterface<T> {
    BLOG_TYPES: T = <any>'BLOG_TYPES';
}

const BlogConfigKeys = new BlogConfigKeysInterface<string>();

export default BlogConfigKeys;