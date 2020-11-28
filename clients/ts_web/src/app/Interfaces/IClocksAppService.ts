import IClock from '../../domain/ServiceInterfaces/IClock'

export default class IClocksAppService {
  init ():Promise<void> {
    throw new Error('Method not implemented.')
  }

  all ():Promise<IClock[]> {
    throw new Error('Method not implemented.')
  }

  add (remain:number, msg?:any):Promise<IClock> {
    throw new Error('Method not implemented.')
  }

  remove (clock:IClock):Promise<void> {
    throw new Error('Method not implemented.')
  }
}
