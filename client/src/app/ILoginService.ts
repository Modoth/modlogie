export interface ILoginUser {
  name?: string,
  editingPermission?: boolean,
  privateFilePermission?: boolean,
  printPermission?: boolean
}

export default class ILoginService {
  login(name: string, pwd: string): Promise<ILoginUser | undefined> {
    throw new Error('Method not implemented.')
  }

  checkLogin(): Promise<ILoginUser | undefined> {
    throw new Error('Method not implemented.')
  }

  logout(direct?: boolean): Promise<any> {
    throw new Error('Method not implemented.')
  }

  raiseUpdate() {
    throw new Error('Method not implemented.')
  }

  updateName(newName: string, password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  updatePassword(password: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  user: ILoginUser | undefined;
}
