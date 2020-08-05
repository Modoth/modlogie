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
import IPasswordStorage from '../domain/IPasswordStorage';

export default class LoginService extends IServicesLocator implements ILoginService {

    async updateName(newName: string, password: string): Promise<void> {
        await ClientRun(this, () => this.locate(LoginServiceClient).updateName(new UpdateNameRequest().setNewname(name).setPassword(password), null))
        this.user = Object.assign({}, this.user, { name: newName })
    }
    async updatePassword(password: string, newPassword: string): Promise<void> {
        await ClientRun(this, () => this.locate(LoginServiceClient).updatePassword(new UpdatePasswordRequest().setPassword(password).setNewpassword(newPassword), null))
        this.user = await this.userFromAccount();
    }

    _user: ILoginUser;

    sameUser(user1: ILoginUser, user2: ILoginUser) {
        return user1 && user2
            && user1.name === user2.name
            && user1.editingPermission === user2.editingPermission
            && user1.printPermission === user2.printPermission
            && user1.privateFilePermission === user2.privateFilePermission
    }

    get user() {
        return this._user;
    }

    set user(value: ILoginUser) {
        if (this.sameUser(this._user, value))
            this._user = value;
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

    async updatePwdStorage(user: ILoginUser, pwd?: string): Promise<void> {
        var pwdStorage = this.locate(IPasswordStorage);
        if (!pwdStorage) {
            return;
        }
        if (!user.name) {
            pwdStorage.clear();
            return;
        }
        pwdStorage.name = user.name;
        if (pwd && pwdStorage.autoLogin) {
            pwdStorage.password = pwd;
        }
    }

    async login(name: string, pwd: string, stopWhenFailed = false): Promise<boolean> {
        try {
            var request = new Account();
            request.setName(name)
            request.setPwd(pwd);
            var res = await ClientRun(this, () => this.locate(LoginServiceClient).login(request, null))
            if (stopWhenFailed && !res.getName()) {
                return false;
            }
            this.user = await this.userFromAccount(res);
            this.updatePwdStorage(this.user, pwd);
            return !!this.user.name
        } catch (e) {
            if (stopWhenFailed) {
                return false;
            }
            throw e;
        }
    }

    async checkLogin(): Promise<boolean> {
        var res = await ClientRun(this, () => this.locate(LoginServiceClient).checkLogin(new Empty(), null));
        if (res.getName()) {
            this.user = await this.userFromAccount(res);
            return true;
        }
        var autoLoginRes = await this.tryAutoLogin(false);
        if (!autoLoginRes) {
            this._user = await this.userFromAccount();
        }
        return autoLoginRes;
    }

    async tryAutoLogin(stopWhenFailed = false): Promise<boolean> {
        var pwdStorage = this.locate(IPasswordStorage);
        if (!pwdStorage) {
            return false;
        }
        var name = pwdStorage.name;
        if (!name) {
            return false;
        }
        var pwd = pwdStorage.password;
        if (!pwd) {
            return false;
        }
        return await this.login(name, pwd, stopWhenFailed);
    }

    async logout(direct?: boolean | undefined): Promise<any> {
        if (!direct) {
            await ClientRun(this, () => this.locate(LoginServiceClient).logout(new Empty(), null));
        }
        this.user = await this.userFromAccount();
        this.updatePwdStorage(this.user);
    }

    raiseUpdate(): void {
        if (this.onUserChanged) {
            this.onUserChanged(this._user);
        }
    }

}