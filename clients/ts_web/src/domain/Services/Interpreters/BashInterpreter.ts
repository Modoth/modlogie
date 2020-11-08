import { ILangInterpreter, InterpreterInfo, InterpretRequest, InterpretResponse } from '../../ServiceInterfaces/ILangInterpretersService'

export class BashInterpreter implements ILangInterpreter {
    _info = new InterpreterInfo(new Set(['bash']))
    get info (): InterpreterInfo {
      return this._info
    };

    async interpret (request: InterpretRequest): Promise<InterpretResponse> {
      return new InterpretResponse('', 'Not implemented')
    }
}
