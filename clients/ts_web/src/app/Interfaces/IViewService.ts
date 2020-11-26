import { ArticleContentType } from '../../pluginbase/IPluginInfo'
import Article from '../../domain/ServiceInterfaces/Article'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'

export interface IPromptField<TValue, TType extends
'Article' |
'Enum' |
'File' |
'Image' |
'Label' |
'Markdown' |
'Password' |
'QrCode' |
'View'|
'Text' |
'TextFile' |
'TreeSelect' |
'Video'
> {
  type: TType;
  hint?: string;
  value: TValue;
  values?: TValue[];
  multiline?: boolean;
  icon?: React.ReactNode
  accept?: string;
}

export default class IViewService {
  setLoading (loading: boolean): void {
    throw new Error('Method not implemented.')
  }

  setShowTitle? (show?: boolean): boolean {
    throw new Error('Method not implemented.')
  }

  setShowFloatingMenu? (show?: boolean): boolean {
    throw new Error('Method not implemented.')
  }

  setFloatingMenus? (key:string, menus?:React.ReactNode, inc = false) {
    throw new Error('Method not implemented.')
  }

  error (msg: string, timeout?: number | undefined): void {
    throw new Error('Method not implemented.')
  }

  errorKey (langs: ILangsService, key: any, timeout?: number | undefined): void {
    throw new Error('Method not implemented.')
  }

  prompt (title: string | { title: string, subTitle: string }, fields: IPromptField<any, any>[], onOk: (...paras: any) => Promise<boolean | undefined>, tryPreviewFile = true): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  previewImage (url: string): void {
    throw new Error('Method not implemented.')
  }

  previewArticleList (visiable: boolean): void {
    throw new Error('Method not implemented.')
  }

  previewArticle (article?: Article, type?: ArticleContentType, onclose?: { (): void }): void {
    throw new Error('Method not implemented.')
  }

  captureElement (element: HTMLElement | undefined): void {
    throw new Error('Method not implemented.')
  }
}
