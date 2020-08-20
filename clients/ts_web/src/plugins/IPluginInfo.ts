import { ArticleFile, ArticleContent } from '../domain/Article'
import { MouseEventHandler } from 'react'
import IConfigsService, { Config } from '../domain/IConfigsSercice';
type Tag = any;
export interface ArticleType {
  route: string;
  name: string;
  subTypes?: string[];
  subTypeTag?: string;
  rootSubjectId?: string;
  orderBy?: string,
  orderByDesc?: boolean,
  initArticleCount?: number;
  defaultSections?: string;
  iconUrl?: string;
  noTitle?: boolean;
  admOnly?: boolean;
  icon: React.ReactNode;
  loadAdditionalsSync?: boolean;
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
  Editor: (props: ArticleContentEditorProps) => JSX.Element;
}

export interface ArticleContentEditorCallbacks<T> {
  addFile(file: ArticleFile): void
  remoteFile(file: ArticleFile): void
  getEditedContent(): T
}

export interface ArticleContentType {
  name: string,
  noTitle?: boolean;
  additionalSections: Set<string>,
  allSections: Set<string>,
  articleType: ArticleType,
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
}

export interface ArticleContentViewerCallbacks {
  gotoSection(section: string): void;
  onSection(section: string): void;
  onSections(sections: string[]): void
};

export class ArticleContentViewerProps {
  title?: string
  showTitle?: boolean
  published?: Date
  content: ArticleContent
  files?: ArticleFile[]
  tags?: Tag[]
  type?: ArticleContentType
  className?: string
  onClick?: MouseEventHandler<any>;
  showHiddens?: boolean;
  viewerCallbacks?: ArticleContentViewerCallbacks;
  print?: boolean;
}

export class ArticleContentEditorProps extends ArticleContentViewerProps {
  callbacks: ArticleContentEditorCallbacks<ArticleContent>
  onpaste: (file: File) => void
}

export default class IPluginInfo {
  constructor(typeNames: string[]) {
    throw new Error('Method not implemented.')
  }

  init(configs: IConfigsService): Promise<any> {
    throw new Error('Method not implemented.')
  }

  get types(): ArticleType[] {
    throw new Error('Method not implemented.')
  }

  get defaultConfigs(): Config[] {
    throw new Error('Method not implemented.')
  }

  get langs(): { [key: string]: string } {
    throw new Error('Method not implemented.')
  }
}

export class PluginsConfig {
  constructor(private _plugins: IPluginInfo[]) {
    this._allTypes = this._plugins.flatMap(p => p.types).filter(t => t.rootSubjectId);
    this._normalTypes = this._allTypes.filter(t => !t.admOnly && t.initArticleCount);
  };
  public get Plugins() {
    return Array.from(this._plugins);
  }

  private _allTypes: ArticleType[];
  private _normalTypes: ArticleType[];

  public get AllTypes() {
    return this._allTypes;
  }

  public get NormalTypes() {
    return this._normalTypes;
  }
}
