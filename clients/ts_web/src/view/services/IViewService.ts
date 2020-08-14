import ILangsService from '../../domain/ILangsService'
import { ArticleContentType } from '../../plugins/IPluginInfo'
import Article from '../../domain/Article'

export interface IPromptField<TValue, TType extends 'Text' | 'TreeSelect' | 'Password' | 'Enum' | 'File' | 'Image' | 'TextFile' | 'Video'> {
  type: TType;
  hint?: string;
  value: TValue;
  values?: TValue[];
  multiline?: boolean;
  icon?: React.ReactNode
  accept?: string;
}

export default class IViewService {
  setLoading(loading: boolean): void {
    throw new Error('Method not implemented.')
  }

  get showMenu(): boolean {
    throw new Error('Method not implemented.')
  }

  setShowMenu(showMenu: boolean): void {
    throw new Error('Method not implemented.')
  }

  onShowMenuChanged?(showMenu: boolean): void {
    throw new Error('Method not implemented.')
  }

  error(msg: string, timeout?: number | undefined): void {
    throw new Error('Method not implemented.')
  }

  errorKey(langs: ILangsService, key: any, timeout?: number | undefined): void {
    throw new Error('Method not implemented.')
  }

  prompt(title: string, fields: IPromptField<any, any>[], onOk: (...paras: any) => Promise<boolean | undefined>): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  previewImage(url: string): void {
    throw new Error('Method not implemented.')
  }

  previewArticleList(visiable: boolean): void {
    throw new Error('Method not implemented.')
  }

  previewArticle(article?: Article, type?: ArticleContentType): void {
    throw new Error('Method not implemented.')
  }

  captureElement(element: HTMLElement | undefined): void {
    throw new Error('Method not implemented.')
  }
}
