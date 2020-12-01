export class ArticleTag {
  constructor (
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

export enum ArticleAdditionalType {
  Normal = 0,
  Recommend = 1
}

export default interface Article {
  id?: string;
  path?: string;
  additionId?: string,
  subjectId?: string;
  name?: string;
  additionalType?: ArticleAdditionalType,
  content?: ArticleContent;
  published?: Date,
  files?: ArticleFile[];
  tags?: Array<ArticleTag>;
  tagsDict?: Map<string, ArticleTag>;
  publishes?:Map<string, string>;
  lazyLoading?: { (): Promise<void> }
  lazyLoadingAddition?: { (): Promise<void> }
}
