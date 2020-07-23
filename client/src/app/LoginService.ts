import ILoginService, { ILoginUser } from './ILoginService'
import { LoginServiceClient } from '../apis/LoginServiceClientPb';
import IServicesLocator from '../common/IServicesLocator';
import { Account, UserReply } from '../apis/login_pb';
import { Empty } from 'google-protobuf/google/protobuf/empty_pb';
import { ClientRun } from '../common/GrpcUtils';

export default class LoginService extends IServicesLocator implements ILoginService {

    _user: ILoginUser | undefined;

    get user() {
        return this._user;
    }

    set user(value: ILoginUser | undefined) {
        this._user = value
        this.raiseUpdate();
    }

    public onUserChanged?: { (user?: ILoginUser): void }

    async login(name: string, pwd: string): Promise<any> {
        var request = new Account();
        request.setName(name)
        request.setPwd(pwd);
        var res = await ClientRun(() => this.locate(LoginServiceClient).login(request, null))
        var name = res.getName();
        this.user = name ? { name } : undefined;
    }

    async checkLogin(): Promise<any> {
        var res = await ClientRun(() => this.locate(LoginServiceClient).checkLogin(new Empty(), null));
        var name = res.getName();
        this.user = name ? { name } : undefined;
    }

    async logout(direct?: boolean | undefined): Promise<any> {
        if (!direct) {
            await ClientRun(() => this.locate(LoginServiceClient).logout(new Empty(), null));
        }
        this.user = undefined;
    }

    raiseUpdate(): void {
        if (this.onUserChanged) {
            this.onUserChanged(this._user);
        }
    }

}