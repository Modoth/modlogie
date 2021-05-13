import ConfigKeys from '../../ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../ServiceInterfaces/IConfigsSercice'
import ILangInterpretersService, { ILangInterpreter, InterpreterInfo, InterpretRequest, InterpretResponse } from '../../ServiceInterfaces/ILangInterpretersService'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'
import pako from 'pako'

class RemoteEmbedLangInterpreter extends InterpreterInfo implements ILangInterpreter {
  constructor(langs: Set<string>, public embedTemplate: string) {
    super(langs, undefined, undefined)
  }

  get info(): InterpreterInfo {
    return this
  }

  interpretUrl?(request: InterpretRequest): string {
    return this.embedTemplate
      .replace('$lang', encodeURIComponent(request.lang || ''))
      .replace('$version', encodeURIComponent(request.version || ''))
      .replace('$code', encodeURIComponent(request.code || ''))
  }
}
type ApiResult = { "Errors": string, "Events": { "Message": string, "Kind": "stdout" | "sterr", "Delay": number }[] }

type ApiRequest = { code: string, lang?: string, version?: string }

class RemoteApiLangInterpreter extends InterpreterInfo implements ILangInterpreter {
  constructor(langs: Set<string>, public apiUrl: string, public type: string) {
    super(langs, undefined, undefined)
  }

  get info(): InterpreterInfo {
    return this
  }

  private async fromJsonServer(request: ApiRequest): Promise<ApiResult> {
    try {
      return await (await fetch(this.apiUrl, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(request)
      })).json() as ApiResult
    } catch {
      return { Errors: "Server Error", Events: [] }
    }
  }

  private async fromBase64Server(request: ApiRequest): Promise<ApiResult> {
    let data = new Uint8Array(new TextEncoder().encode(JSON.stringify(request)))
    data = pako.deflate(data)
    const base64 = btoa(String.fromCharCode(...data))
    try {
      return await (await fetch(this.apiUrl + '/' + base64, {
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json'
        },
        referrerPolicy: 'no-referrer'
      })).json() as ApiResult
    } catch {
      return { Errors: "Server Error", Events: [] }
    }
  }

  async interpret(request: InterpretRequest): Promise<InterpretResponse> {
    var method = (this as any)[`from${this.type}Server`] as ((req: ApiRequest) => Promise<ApiResult>) | undefined
    if (method === undefined) {
      return new InterpretResponse('', '')
    }
    var apiRes = (await method.bind(this)(request))
    if(apiRes.Errors){
      return new InterpretResponse('', apiRes.Errors)
    }
    return new InterpretResponse((apiRes.Events || []).map(e => e.Message).join("\n"))

  }
}

export default class LangInterpretersService extends IServicesLocator implements ILangInterpretersService {
  private interpreters = new Map<string, ILangInterpreter>();
  private interpretersPromise: Promise<Map<string, ILangInterpreter>>
  async getInterpreters(): Promise<Map<string, ILangInterpreter>> {
    if (this.interpretersPromise) {
      return this.interpretersPromise
    }
    const configs = (await this.locate(IConfigsService).getFieldsOrDefault(ConfigKeys.LANGS_SERVER)).reverse()
    for (const config of configs) {
      let [server, ...langs] = config
      let apiFormat = ''
      let apiMatch = server.match(/^<(.*)>(.*)$/)
      if (apiMatch) {
        server = apiMatch[2]
        apiFormat = apiMatch[1]
      }
      if (!langs.length || !server) {
        continue
      }
      const interpreter = apiFormat ?
        new RemoteApiLangInterpreter(new Set(langs), server, apiFormat)
        : new RemoteEmbedLangInterpreter(new Set(langs), server)
      this.set(interpreter)
    }
    this.interpretersPromise =
      Promise.resolve(this.interpreters)
    return this.interpretersPromise
  }

  async get(name: string): Promise<ILangInterpreter | undefined> {
    const interpreters = await this.getInterpreters()
    if (interpreters.has(name)) {
      return interpreters.get(name)
    }
  }

  set(interpreter: ILangInterpreter) {
    if (!interpreter || !interpreter.info || !interpreter.info.langs || !interpreter.info.langs.size) {
      throw new Error('Invalid interpreter info.')
    }
    interpreter.info.langs.forEach(lang => this.interpreters.set(lang, interpreter))
  }
}
