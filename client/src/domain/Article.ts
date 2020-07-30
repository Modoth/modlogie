export class ArticleTag {
  constructor(
    public name: string,
    public values: string[],
    public id: string,
    public value?: string
  ) { }
}

export interface ArticleFile {
  name?: string;
  id?: string;
  url?: string;
}

export interface ArticleSection {
  name?: string;
  type?: string;
  content: string;
}

export interface ArticleContent {
  sections?: ArticleSection[]
}

export default interface Article {
  id?: string;
  subjectId?: string;
  name?: string;
  content?: ArticleContent;
  files?: ArticleFile[];
  tags?: Array<ArticleTag>;
  tagsDict?: Map<string, ArticleTag>;
  lazyLoading?: { (): Promise<void> }
}
