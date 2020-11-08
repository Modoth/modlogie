export interface UserLoginResult{
    name?:string;
    isAdm?:boolean;
    isAuthorised?:boolean
}

export default class IUserLoginService {
  updateName (name: string, password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  updatePassword (password: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  login (name: string, pwd: string): Promise<UserLoginResult> {
    throw new Error('Method not implemented.')
  }

  checkLogin (): Promise<UserLoginResult> {
    throw new Error('Method not implemented.')
  }

  logout (): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
