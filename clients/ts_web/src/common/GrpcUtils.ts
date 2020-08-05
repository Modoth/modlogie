import ILangsService, { LangKeys } from "../domain/ILangsService";
import { Error as ErrorMessage } from "../apis/messages_pb";
import Langs from "../view/Langs";
import IServicesLocator from "./IServicesLocator";
import ILoginService from "../app/ILoginService";
import IViewService from "../view/services/IViewService";
import IPasswordStorage from "../domain/IPasswordStorage";

export async function ClientRun<T extends { getError(): ErrorMessage }>(_this: IServicesLocator | null, func: { (): Promise<T> }): Promise<T> {
    var res = undefined as unknown as T;
    try {
        res = await func();
    }
    catch (e) {
        console.log(e);
        throw new Error(LangKeys.MSG_ERROR_NETWORK);
    }
    var error = res.getError();
    if (_this && error == ErrorMessage.NEED_LOGIN) {
        var loginService = _this.locate(ILoginService);
        if (await loginService.tryAutoLogin(true)) {
            return await ClientRun(null, func)
        }
        const viewService = _this.locate(IViewService)
        const langs = _this.locate(ILangsService)
        let defName = _this.locate(IPasswordStorage).name;
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
                    },
                ],
                async (name: string, password: string) => {
                    if (!name || !password) {
                        return false;
                    }
                    defName = name;
                    if (!await loginService.login(name, password, true)) {
                        viewService.error(langs.get(LangKeys.MSG_ERROR_USER_OR_PWD))
                        return false;
                    }
                    return true;
                })
        }
        if (await startLogin()) {
            return await ClientRun(null, func)
        }
    }
    if (error > 0) {
        throw new Error(Langs[error]);
    }
    return res;
}