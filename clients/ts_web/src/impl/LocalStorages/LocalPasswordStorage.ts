import IPasswordStorage from '../../domain/ServiceInterfaces/IPasswordStorage'

export default class LocalPasswordStorage implements IPasswordStorage {
  clear (): void {
    this.autoLogin = false
    // this.name = null;
    this.password = null
  }

    private AUTO_LOGIN_KEY = 'auto_login';
    private USER_NAME_KEY = 'user_name';
    private USER_PWD_KEY = 'user_pwd';

    get autoLogin (): boolean {
      return window.localStorage.getItem(this.AUTO_LOGIN_KEY) === 'true'
    }

    set autoLogin (value: boolean) {
      if (value) {
        window.localStorage.setItem(this.AUTO_LOGIN_KEY, 'true')
      } else {
        window.localStorage.removeItem(this.AUTO_LOGIN_KEY)
      }
    }

    get name (): string | null {
      return window.localStorage.getItem(this.USER_NAME_KEY)
    }

    set name (value: string | null) {
      if (value) {
        window.localStorage.setItem(this.USER_NAME_KEY, value)
      } else {
        window.localStorage.removeItem(this.USER_NAME_KEY)
      }
    }

    get password (): string | null {
      return window.localStorage.getItem(this.USER_PWD_KEY)
    }

    set password (value: string | null) {
      if (value) {
        window.localStorage.setItem(this.USER_PWD_KEY, value)
      } else {
        window.localStorage.removeItem(this.USER_PWD_KEY)
      }
    }
}
