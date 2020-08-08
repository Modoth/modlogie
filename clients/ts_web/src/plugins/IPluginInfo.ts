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
  iconUrl?: string;
  noTitle?: boolean;
  admOnly?: boolean;
  icon: React.ReactNode;
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
  hidenSections: Set<string>,
  allSections: Set<string>,
  articleType: ArticleType,
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
}

export class ArticleContentViewerProps {
  title?: string
  showTitle?: boolean
  content: ArticleContent
  files?: ArticleFile[]
  tags?: Tag[]
  type?: ArticleContentType
  className?: string
  onClick?: MouseEventHandler<any>;
  showHiddens?: boolean;
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
    this._normalTypes = this._allTypes.filter(t => !t.admOnly);
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
