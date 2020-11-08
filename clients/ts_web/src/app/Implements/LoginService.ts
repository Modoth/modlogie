import { UserRoleKeys } from '../Interfaces/DefaultConfigs'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import ILoginAppservice, { ILoginUser } from '../Interfaces/ILoginAppservice'
import IPasswordStorage from '../../domain/ServiceInterfaces/IPasswordStorage'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IUserLoginService, { UserLoginResult } from '../../domain/ServiceInterfaces/IUserLoginService'

export default class LoginService extends IServicesLocator implements ILoginAppservice {
  get server () {
    return this.locate(IUserLoginService)
  }

  async updateName (newName: string, password: string): Promise<void> {
    await this.server.updateName(newName, password)
    this.user = Object.assign({}, this.user, { name: newName })
  }

  async updatePassword (password: string, newPassword: string): Promise<void> {
    await this.server.updatePassword(password, newPassword)
    this.user = await this.userFromAccount()
  }

    _user: ILoginUser;

    sameUser (user1: ILoginUser, user2: ILoginUser) {
      return user1 && user2 &&
            user1.name === user2.name &&
            user1.editingPermission === user2.editingPermission &&
            user1.printPermission === user2.printPermission &&
            user1.privateFilePermission === user2.privateFilePermission
    }

    get user () {
      return this._user
    }

    set user (value: ILoginUser) {
      let raiseUpdate = !this.sameUser(this._user, value)
      this._user = value
      if (raiseUpdate) {
        this.raiseUpdate()
      }
    }

    private async checkAllowPrint (role: string): Promise<boolean> {
      let config = await this.locate(IConfigsService).get(ConfigKeys.ALLOW_PRINT)
      if (!config || !config.values || !config.values!.length) {
        return false
      }
      let allow = config!.value || config.defaultValue
      if (!allow) {
        return false
      }
      let allowIdx = config.values!.indexOf(allow)
      if (allowIdx < 0) {
        return false
      }
      let roleIdx = config.values!.indexOf(role)
      return roleIdx >= allowIdx
    }

    onUserChanged?: { (user: ILoginUser): void }

    async userFromAccount (account?: UserLoginResult): Promise<ILoginUser> {
      if (account) {
        let name = account.name
        let role = name ? UserRoleKeys.NORMAL : UserRoleKeys.UNLOGIN
        let user: ILoginUser = name ? { name } : {}
        if (account.isAdm) {
          role = UserRoleKeys.ADM
          user.editingPermission = true
        } else if (account.isAuthorised) {
          role = UserRoleKeys.AUTHORISED
          user.privateFilePermission = true
        }
        user.printPermission = await this.checkAllowPrint(role)
        return user
      } else {
        return { printPermission: await this.checkAllowPrint(UserRoleKeys.UNLOGIN) }
      }
    }

    async updatePwdStorage (user: ILoginUser, pwd?: string): Promise<void> {
      let pwdStorage = this.locate(IPasswordStorage)
      if (!pwdStorage) {
        return
      }
      if (!user.name) {
        pwdStorage.clear()
        return
      }
      pwdStorage.name = user.name
      if (pwd && pwdStorage.autoLogin) {
        pwdStorage.password = pwd
      }
    }

    async login (name: string, pwd: string, stopWhenFailed = false): Promise<boolean> {
      try {
        let res = await this.server.login(name, pwd)
        if (stopWhenFailed && !res.name) {
          return false
        }
        this.user = await this.userFromAccount(res)
        this.updatePwdStorage(this.user, pwd)
        return !!this.user.name
      } catch (e) {
        if (stopWhenFailed) {
          return false
        }
        throw e
      }
    }

    async checkLogin (): Promise<boolean> {
      let res = await this.server.checkLogin()
      if (res.name) {
        this.user = await this.userFromAccount(res)
        return true
      }
      let autoLoginRes = await this.tryAutoLogin(false)
      if (!autoLoginRes) {
        this._user = await this.userFromAccount()
      }
      return autoLoginRes
    }

    async tryAutoLogin (stopWhenFailed = false): Promise<boolean> {
      let pwdStorage = this.locate(IPasswordStorage)
      if (!pwdStorage) {
        return false
      }
      let name = pwdStorage.name
      if (!name) {
        return false
      }
      let pwd = pwdStorage.password
      if (!pwd) {
        return false
      }
      return await this.login(name, pwd, stopWhenFailed)
    }

    async logout (direct?: boolean | undefined): Promise<any> {
      if (!direct) {
        await this.server.logout()
      }
      this.user = await this.userFromAccount()
      this.updatePwdStorage(this.user)
    }

    raiseUpdate (): void {
      if (this.onUserChanged) {
        this.onUserChanged(this._user)
      }
    }
}
