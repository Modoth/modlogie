import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { LoginServiceClient } from '../remote-apis/LoginServiceClientPb'
import { UpdateNameRequest, UpdatePasswordRequest, Account, AccountReply } from '../remote-apis/login_pb'
import { User } from '../remote-apis/users_pb'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IUserLoginService, { UserLoginResult } from '../../domain/ServiceInterfaces/IUserLoginService'

export default class UserLoginService extends IServicesLocator implements IUserLoginService {
  resultFromAccount (account?: AccountReply): UserLoginResult {
    if (account && account.getName()) {
      const name = account.getName()
      const type = account.getType()
      return { name, isAdm: type === User.Type.ADM, isAuthorised: type === User.Type.AUTHORISED }
    } else {
      return { }
    }
  }

  async updateName (name: string, password: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(LoginServiceClient).updateName(new UpdateNameRequest().setNewname(name).setPassword(password), null))
  }

  async updatePassword (password: string, newPassword: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(LoginServiceClient).updatePassword(new UpdatePasswordRequest().setPassword(password).setNewpassword(newPassword), null))
  }

  async login (name: string, pwd: string): Promise<UserLoginResult> {
    const request = new Account()
    request.setName(name)
    request.setPwd(pwd)
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(LoginServiceClient).login(request, null))
    return this.resultFromAccount(res)
  }

  async checkLogin (): Promise<UserLoginResult> {
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(LoginServiceClient).checkLogin(new Empty(), null))
    return this.resultFromAccount(res)
  }

  async logout (): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(LoginServiceClient).logout(new Empty(), null))
  }
}
