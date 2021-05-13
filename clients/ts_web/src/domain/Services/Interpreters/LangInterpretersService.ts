import ConfigKeys from '../../ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../ServiceInterfaces/IConfigsSercice'
import ILangInterpretersService, { ILangInterpreter, InterpreterInfo, InterpretRequest, InterpretResponse } from '../../ServiceInterfaces/ILangInterpretersService'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'

class RemoteEmbedLangInterpreter extends InterpreterInfo implements ILangInterpreter {
  constructor (langs: Set<string>, public embedTemplate: string) {
    super(langs, undefined, undefined)
  }

  get info (): InterpreterInfo {
    return this
  }

  interpretUrl? (request: InterpretRequest): string {
    return this.embedTemplate
      .replace('$lang', encodeURIComponent(request.lang || ''))
      .replace('$version', encodeURIComponent(request.version || ''))
      .replace('$code', encodeURIComponent(request.code || ''))
  }
}
type ApiResult = { "Errors": string, "Events": { "Message": string, "Kind": "stdout" | "sterr", "Delay": number }[] }

type ApiRequest = {code: string, lang?: string, version?: string }

class RemoteApiLangInterpreter extends InterpreterInfo implements ILangInterpreter {
  constructor (langs: Set<string>, public apiUrl: string) {
    super(langs, undefined, undefined)
  }

  get info (): InterpreterInfo {
    return this
  }


  async interpret(request: InterpretRequest): Promise<InterpretResponse> {
    try {
      let apiReq = request as ApiRequest
      const s = await (await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(apiReq)
      })).json() as ApiResult;
      if (s.Errors) {
        return new InterpretResponse('', s.Errors)
      }
      return new InterpretResponse((s.Events || []).map(e => e.Message).join("\n"))
    }
    catch {
      return new InterpretResponse('', '')
    }
  }
}

export default class LangInterpretersService extends IServicesLocator implements ILangInterpretersService {
    private interpreters = new Map<string, ILangInterpreter>();
    private interpretersPromise: Promise<Map<string, ILangInterpreter>>
    async getInterpreters (): Promise<Map<string, ILangInterpreter>> {
      if (this.interpretersPromise) {
        return this.interpretersPromise
      }
      const configs = (await this.locate(IConfigsService).getFieldsOrDefault(ConfigKeys.LANGS_SERVER)).reverse()
      for (const config of configs) {
        let [server, ...langs] = config
        const apiServerPrefix = '_'
        let apiServer = false
        if (server.startsWith(apiServerPrefix)){
          server = server.slice(apiServerPrefix.length)
          apiServer = true
        }
        if (!langs.length || !server) {
          continue
        }
        const interpreter = apiServer ?
          new RemoteApiLangInterpreter(new Set(langs), server)
          : new RemoteEmbedLangInterpreter(new Set(langs), server)
        this.set(interpreter)
      }
      this.interpretersPromise =
            Promise.resolve(this.interpreters)
      return this.interpretersPromise
    }

    async get (name: string): Promise<ILangInterpreter | undefined> {
      const interpreters = await this.getInterpreters()
      if (interpreters.has(name)) {
        return interpreters.get(name)
      }
    }

    set (interpreter: ILangInterpreter) {
      if (!interpreter || !interpreter.info || !interpreter.info.langs || !interpreter.info.langs.size) {
        throw new Error('Invalid interpreter info.')
      }
      interpreter.info.langs.forEach(lang => this.interpreters.set(lang, interpreter))
    }
}
