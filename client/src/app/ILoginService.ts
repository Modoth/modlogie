type LoginUser = any;

export interface ILoginUser extends LoginUser {
  name: string,
}

export default class ILoginService {
  login(name: string, pwd: string): Promise<LoginUser | undefined> {
    throw new Error('Method not implemented.')
  }

  checkLogin(): Promise<LoginUser | undefined> {
    throw new Error('Method not implemented.')
  }

  logout(direct?: boolean): Promise<any> {
    throw new Error('Method not implemented.')
  }

  raiseUpdate() {
    throw new Error('Method not implemented.')
  }

  user: ILoginUser | undefined;
}
