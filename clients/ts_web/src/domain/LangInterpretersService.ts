import ILangInterpretersService, { ILangInterpreter } from "./ILangInterpretersService";

export default class LangInterpretersService implements ILangInterpretersService {
    _interpreters = new Map<string, ILangInterpreter>();
    get(name: string): ILangInterpreter | undefined {
        if (this._interpreters.has(name)) {
            return this._interpreters.get(name)
        }
    }
    set(interpreter: ILangInterpreter) {
        if (!interpreter || !interpreter.info || !interpreter.info.langs || !interpreter.info.langs.size) {
            throw new Error("Invalid interpreter info.")
        }
        interpreter.info.langs.forEach(lang => this._interpreters.set(lang, interpreter))
    }
}