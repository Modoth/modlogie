export interface ContentTemplateData {
  pageSize?:number,
  listPrefix?:string,
  listSurfix?:string,
  articlePrefix?:string,
  articleSurfix?:string,
}

export interface ContentTemplate{
    id:string;
    name:string;
    data:ContentTemplateData;
}

export default class IContentTemplatesService {
  all ():Promise<ContentTemplate[]> {
    throw new Error('Method not implemented')
  }

  delete (id:string):Promise<void> {
    throw new Error('Method not implemented')
  }

  add (name:string, data:ContentTemplateData):Promise<string> {
    throw new Error('Method not implemented')
  }

  update (id:string, data:ContentTemplateData):Promise<void> {
    throw new Error('Method not implemented')
  }
}
