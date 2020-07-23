import { ArticleFile, ArticleContent } from '../domain/Article'
import { MouseEventHandler } from 'react'
import IConfigsService, { Config } from '../domain/IConfigsSercice';
type Tag = any;
export interface ArticleType {
  route: string;
  name: string;
  subTypes?: string[];
  subTypeTag?: string;
  rootSubject?: string;
  noTitle?: boolean;
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
  hidenSections: Set<string>,
  allSections: Set<string>,
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
}

export class ArticleContentViewerProps {
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
  constructor(private _plugins: IPluginInfo[]) { };
  public get Plugins() {
    return Array.from(this._plugins);
  }
}
