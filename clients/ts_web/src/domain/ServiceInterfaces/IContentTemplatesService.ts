export interface ContentTemplate{
    id:string;
    name:string;
    data:string;
}

export default class IContentTemplatesService {
  all ():Promise<ContentTemplate[]> {
    throw new Error('Method not implemented')
  }

  delete (id:string):Promise<void> {
    throw new Error('Method not implemented')
  }

  add (name:string, data:string):Promise<string> {
    throw new Error('Method not implemented')
  }

  update (id:string, data:string):Promise<void> {
    throw new Error('Method not implemented')
  }
}
