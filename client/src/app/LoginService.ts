import ILoginService, { ILoginUser } from './ILoginService'
import { LoginServiceClient } from '../apis/LoginServiceClientPb';
import IServicesLocator from '../common/IServicesLocator';
import { Account, AccountReply, UpdatePasswordRequest, UpdateNameRequest } from '../apis/login_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { ClientRun } from '../common/GrpcUtils';
import { User } from '../apis/users_pb';
import IConfigsService from '../domain/IConfigsSercice';
import ConfigKeys from './ConfigKeys';
import { UserRoleKeys } from './DefaultConfigs';

export default class LoginService extends IServicesLocator implements ILoginService {

    async updateName(newName: string, password: string): Promise<void> {
        await ClientRun(() => this.locate(LoginServiceClient).updateName(new UpdateNameRequest().setNewname(name).setPassword(password), null))
        this.user = Object.assign({}, this.user, { name: newName })
    }
    async updatePassword(password: string, newPassword: string): Promise<void> {
        await ClientRun(() => this.locate(LoginServiceClient).updatePassword(new UpdatePasswordRequest().setPassword(password).setNewpassword(newPassword), null))
        this.user = await this.userFromAccount();
    }

    _user: ILoginUser;

    get user() {
        return this._user;
    }

    set user(value: ILoginUser) {
        this._user = value
        this.raiseUpdate();
    }

    private async checkAllowPrint(role: string): Promise<boolean> {
        var config = await this.locate(IConfigsService).get(ConfigKeys.ALLOW_PRINT);
        if (!config || !config.values || !config.values!.length) {
            return false;
        }
        var allow = config!.value || config.defaultValue
        if (!allow) {
            return false;
        }
        var allowIdx = config.values!.indexOf(allow)
        if (allowIdx < 0) {
            return false;
        }
        var roleIdx = config.values!.indexOf(role)
        return roleIdx >= allowIdx;
    }

    public onUserChanged?: { (user: ILoginUser): void }

    async userFromAccount(account?: AccountReply): Promise<ILoginUser> {
        if (account) {
            var name = account.getName();
            var role = name ? UserRoleKeys.NORMAL : UserRoleKeys.UNLOGIN
            var type = account.getType();
            var user: ILoginUser = name ? { name } : {};
            if (type === User.Type.ADM) {
                role = UserRoleKeys.ADM
                user.editingPermission = true;
            } else if (type === User.Type.AUTHORISED) {
                role = UserRoleKeys.AUTHORISED
                user.privateFilePermission = true;
            }
            user.printPermission = await this.checkAllowPrint(role);
            return user;
        } else {
            return { printPermission: await this.checkAllowPrint(UserRoleKeys.UNLOGIN) }
        }
    }

    async login(name: string, pwd: string): Promise<any> {
        var request = new Account();
        request.setName(name)
        request.setPwd(pwd);
        var res = await ClientRun(() => this.locate(LoginServiceClient).login(request, null))
        this.user = await this.userFromAccount(res);
    }

    async checkLogin(): Promise<any> {
        var res = await ClientRun(() => this.locate(LoginServiceClient).checkLogin(new Empty(), null));
        this.user = await this.userFromAccount(res);
    }

    async logout(direct?: boolean | undefined): Promise<any> {
        if (!direct) {
            await ClientRun(() => this.locate(LoginServiceClient).logout(new Empty(), null));
        }
        this.user = await this.userFromAccount();
    }

    raiseUpdate(): void {
        if (this.onUserChanged) {
            this.onUserChanged(this._user);
        }
    }

}