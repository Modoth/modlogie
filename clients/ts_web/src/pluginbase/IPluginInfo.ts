import { ArticleFile, ArticleContent } from '../domain/ServiceInterfaces/Article'
import { MouseEventHandler } from 'react'
import IConfigsService, { Config } from '../domain/ServiceInterfaces/IConfigsSercice'

type Tag = any;
export interface ArticleType {
  additionalConfigs?: Map<string, string>;
  admOnly?: boolean;
  defaultSections?: string[];
  displayName?: string;
  fixedSections?: boolean;
  icon: React.ReactNode;
  iconUrl?: string;
  initArticleCount?: number;
  loadAdditionalsSync?: boolean;
  name: string;
  pluginName: string;
  noTitle?: boolean;
  orderBy?: string,
  orderByDesc?: boolean,
  rootSubjectId?: string;
  route: string;
  subTypes?: string[];
  subTypeTag?: string;
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
  Editor: (props: ArticleContentEditorProps) => JSX.Element;
  publishGenerators?: Map<string, { generator: (props: ArticleContentViewerProps) => string, previewTemplate?: string, autoUpdate?: boolean }>;
  exporterGenerators?: Map<string, { generator: (props: ArticleContentExporterProps) => string, previewTemplate?: string }>;
}

export interface ArticleContentEditorCallbacks<T> {
  addFile(file: ArticleFile): void
  removeFile(file: ArticleFile): void
  getEditedContent(): T
}

export interface ArticleContentType {
  name: string,
  noTitle?: boolean;
  additionalSections: Set<string>,
  hiddenSections: Set<string>,
  smartHiddenSections: Set<string>,
  allSections: Set<string>,
  articleType: ArticleType,
  Viewer: (props: ArticleContentViewerProps) => JSX.Element;
}

export class NavigationSection {
  constructor (public name: string, public level = 0) {

  }

  children: Array<NavigationSection>
  locate?(direct?: boolean): void
  onLocated?(): void
}

export interface ArticleContentViewerCallbacks {
  onSections(sections: NavigationSection[]): void
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
  showAdditionals?: boolean;
  viewerCallbacks?: ArticleContentViewerCallbacks;
  print?: boolean;
  articleId: string
}

export type ArticleContentExporterProps = ArticleContentViewerProps & {resources:{name:string, url:string} []}

export class ArticleContentEditorProps extends ArticleContentViewerProps {
  callbacks: ArticleContentEditorCallbacks<[ArticleContent, Set<string>]>
  onpaste: (file: File) => void
}

export default class IPluginInfo {
  constructor (typeNames: string[]) {
    throw new Error('Method not implemented.')
  }

  init (configs: IConfigsService): Promise<any> {
    throw new Error('Method not implemented.')
  }

  get name (): string {
    throw new Error('Method not implemented.')
  }

  get types (): ArticleType[] {
    throw new Error('Method not implemented.')
  }

  get defaultConfigs (): Config[] {
    throw new Error('Method not implemented.')
  }

  get langs (): { [key: string]: string } {
    throw new Error('Method not implemented.')
  }
}

export class PluginsConfig {
  constructor (private _plugins: IPluginInfo[]) {
    this._allTypes = this._plugins.flatMap(p => p.types).filter(t => t.rootSubjectId)
    this._normalTypes = this._allTypes.filter(t => !t.admOnly && t.initArticleCount)
  };

  get Plugins () {
    return Array.from(this._plugins)
  }

  private _allTypes: ArticleType[];
  private _normalTypes: ArticleType[];

  get AllTypes () {
    return this._allTypes
  }

  get NormalTypes () {
    return this._normalTypes
  }
}
