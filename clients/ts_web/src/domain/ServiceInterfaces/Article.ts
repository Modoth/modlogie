export class ArticleTag {
  constructor (
    public name: string,
    public values: string[],
    public id: string,
    public value?: string,
    public displayName?: string
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

export const ArticleWeights = Array.from({ length: 7 }, (_, i) => i + 1)

export default interface Article {
  id?: string;
  additionalType?: ArticleAdditionalType,
  additionId?: string,
  content?: ArticleContent;
  files?: ArticleFile[];
  name?: string;
  path?: string;
  private?:boolean,
  published?: Date,
  publishedIds?:Map<string, string>;
  subjectId?: string;
  tags?: Array<ArticleTag>;
  tagsDict?: Map<string, ArticleTag>;
  weight?: number
  lazyLoading?: { (): Promise<void> }
  lazyLoadingAddition?: { (): Promise<void> }
}
