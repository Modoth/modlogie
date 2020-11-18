export interface EditorInfo {name:string, path:string, accept:RegExp}
export const NonEditor:EditorInfo = { name: '', path: '', accept: new RegExp('.') }

export default class IEditorsService {
  init ():Promise<void> {
    throw new Error('Method not implemented.')
  }

  getEditors ():EditorInfo[] {
    throw new Error('Method not implemented.')
  }

  getViewers ():EditorInfo[] {
    throw new Error('Method not implemented.')
  }

  getEditorByFileName (name:string):EditorInfo|undefined {
    throw new Error('Method not implemented.')
  }

  getViewerByFileName (name:string):EditorInfo|undefined {
    throw new Error('Method not implemented.')
  }

  getEditorByName (name:string):EditorInfo|undefined {
    throw new Error('Method not implemented.')
  };

  getViewerByName (name:string):EditorInfo|undefined {
    throw new Error('Method not implemented.')
  }
}
