export class IPublishService {
  publish (type:string, articleId:string, baseUrl:string, url:string, content:string) :Promise<string> {
    throw new Error('Method not implemented.')
  }

  delete (type:string, articleId:string, id:string):Promise<void> {
    throw new Error('Method not implemented.')
  }
}