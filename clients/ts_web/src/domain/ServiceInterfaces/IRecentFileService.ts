export interface RecentFile{
    name:string;
    type:string;
    buff:ArrayBuffer;
    size:number;
}

export default class IRecentFileService {
  limit ():Promise<number> {
    throw new Error('Method not implemented.')
  }

  get (group:string):Promise<RecentFile|undefined> {
    throw new Error('Method not implemented.')
  }

  set (group:string, file?:RecentFile):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
