export interface EditorInfo {name:string, path:string, accept:RegExp}
export const NonEditor:EditorInfo = { name: '', path: '', accept: new RegExp('.') }
export default class IEditorsService {
  getEditors ():Promise<EditorInfo[]> {
    throw new Error('Method not implemented.')
  }

  getViewers ():Promise<EditorInfo[]> {
    throw new Error('Method not implemented.')
  }

  getEditorByFileName (name:string):Promise<EditorInfo|undefined> {
    throw new Error('Method not implemented.')
  };

  getViewerByFileName (name:string):Promise<EditorInfo|undefined> {
    throw new Error('Method not implemented.')
  }

  getEditorByName (name:string):Promise<EditorInfo|undefined> {
    throw new Error('Method not implemented.')
  };

  getViewerByName (name:string):Promise<EditorInfo|undefined> {
    throw new Error('Method not implemented.')
  }
}
