import { LangKeys } from "../domain/ILangsService";
import { Error as ErrorMessage } from "../apis/messages_pb";
import Langs from "../view/Langs";

export async function ClientRun<T extends { getError(): ErrorMessage }>(func: { (): Promise<T> }): Promise<T> {
    var res = undefined as unknown as T;
    try {
        res = await func();
    }
    catch (e) {
        console.log(e);
        throw new Error(LangKeys.MSG_ERROR_NETWORK);
    }
    var error = res.getError();
    if (error > 0) {
        throw new Error(Langs[error]);
    }
    return res;
}