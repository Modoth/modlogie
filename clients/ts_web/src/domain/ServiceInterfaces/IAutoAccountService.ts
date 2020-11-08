export class AutoAccount {
    userName?: string;
    password?: string;
}

export default class IAutoAccountService {
  get (): Promise<AutoAccount> {
    throw new Error('Method not implemented.')
  }
}
