export interface ILoginUser {
  name?: string,
  editingPermission?: boolean,
  privateFilePermission?: boolean,
  printPermission?: boolean
}

export default class ILoginAppservice {
  login (name: string, pwd: string, stopWhenFailed = false): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  tryAutoLogin (stopWhenFailed = false): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  checkLogin (): Promise<boolean> {
    throw new Error('Method not implemented.')
  }

  logout (direct?: boolean): Promise<any> {
    throw new Error('Method not implemented.')
  }

  raiseUpdate () {
    throw new Error('Method not implemented.')
  }

  updateName (newName: string, password: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  updatePassword (password: string, newPassword: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  user: ILoginUser | undefined;
}
