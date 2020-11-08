import ILangsService, { LangKeys, ErrorMessage } from '../../domain/ServiceInterfaces/ILangsService'
import ILoginAppservice from '../Interfaces/ILoginAppservice'
import IPasswordStorage from '../../domain/ServiceInterfaces/IPasswordStorage'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../Interfaces/IViewService'

export default class RemoteServiceInvoker extends IServicesLocator implements IRemoteServiceInvoker {
  async invoke<T extends { getError (): ErrorMessage; }>(func: () => Promise<T>): Promise<T> {
    let res = undefined as unknown as T
    try {
      res = await func()
    } catch (e) {
      console.log(e)
      throw new Error(LangKeys.MSG_ERROR_NETWORK)
    }
    const error = res.getError()
    if (this && error === ErrorMessage.MSG_ERROR_NEED_LOGIN) {
      const loginService = this.locate(ILoginAppservice)
      if (await loginService.tryAutoLogin(true)) {
        return await this.invoke(func)
      }
      const viewService = this.locate(IViewService)
      const langs = this.locate(ILangsService)
      let defName = this.locate(IPasswordStorage).name
      const startLogin = () => {
        return viewService.prompt(
          langs.get(LangKeys.Login),
          [
            {
              type: 'Text',
              value: defName,
              hint: langs.get(LangKeys.UserName)
            },
            {
              type: 'Password',
              value: '',
              hint: langs.get(LangKeys.NewPassword)
            }
          ],
          async (name: string, password: string) => {
            if (!name || !password) {
              return false
            }
            defName = name
            if (!await loginService.login(name, password, true)) {
              viewService.error(langs.get(LangKeys.MSG_ERROR_USER_OR_PWD))
              return false
            }
            return true
          })
      }
      if (await startLogin()) {
        return await this.invoke(func)
      }
    }
    if (error > 0) {
      throw new Error(ErrorMessage[error])
    }
    return res
  }
}
