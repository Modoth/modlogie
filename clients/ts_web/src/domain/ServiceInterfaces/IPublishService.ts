export class IPublishService {
  getTagName (type:string):string {
    throw new Error('Method not implemented.')
  }

  publish (type:string, articleId:string, group:string, url:string, content:string) :Promise<string> {
    throw new Error('Method not implemented.')
  }

  delete (type:string, articleId:string, id:string):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
