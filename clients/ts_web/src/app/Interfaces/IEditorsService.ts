export default class IEditorsService {
  getEditorType (name:string):Promise<string|undefined> {
    throw new Error('Method not implemented.')
  };

  getViewerType (name:string):Promise<string|undefined> {
    throw new Error('Method not implemented.')
  }
}
