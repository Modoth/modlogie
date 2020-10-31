import ConfigKeys from "../app/ConfigKeys";
import IServicesLocator from "../common/IServicesLocator";
import IConfigsService from "./IConfigsSercice";
import ILangInterpretersService, { ILangInterpreter, InterpreterInfo, InterpretRequest, InterpretResponse } from "./ILangInterpretersService";

class EmbedTemplateLangInterpreter extends InterpreterInfo implements ILangInterpreter {
    constructor(public langs: Set<string>, public embedTemplate: string) {
        super(langs, undefined, undefined)
    }
    get info(): InterpreterInfo {
        return this;
    }
    interpretUrl?(request: InterpretRequest): string {
        return this.embedTemplate
            .replace("$LANG", encodeURIComponent(request.lang || ''))
            .replace("$VERSION", encodeURIComponent(request.version || ''))
            .replace("$CODE", encodeURIComponent(request.code || ''))
    }
}

export default class LangInterpretersService extends IServicesLocator implements ILangInterpretersService {
    private interpreters = new Map<string, ILangInterpreter>();
    private interpretersPromise: Promise<Map<string, ILangInterpreter>>
    async getInterpreters(): Promise<Map<string, ILangInterpreter>> {
        if (this.interpretersPromise) {
            return this.interpretersPromise
        }
        const configs = await this.locate(IConfigsService).getValuesOrDefault(ConfigKeys.LANGS_SERVER)
        for (const config of configs) {
            const [server, ...langs] = config.split(',')
            if (!langs.length || !server) {
                continue
            }
            const interpreter = new EmbedTemplateLangInterpreter(new Set(langs), server)
            this.set(interpreter)
        }
        this.interpretersPromise =
            Promise.resolve(this.interpreters)
        return this.interpretersPromise;
    }
    async get(name: string): Promise<ILangInterpreter | undefined> {
        const interpreters = await this.getInterpreters()
        if (interpreters.has(name)) {
            return interpreters.get(name)
        }
    }
    set(interpreter: ILangInterpreter) {
        if (!interpreter || !interpreter.info || !interpreter.info.langs || !interpreter.info.langs.size) {
            throw new Error("Invalid interpreter info.")
        }
        interpreter.info.langs.forEach(lang => this.interpreters.set(lang, interpreter))
    }
}