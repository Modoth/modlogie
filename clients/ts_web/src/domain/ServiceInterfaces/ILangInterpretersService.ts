export class ILangInterpreter {
  get info (): InterpreterInfo {
    throw new Error('Method not implemented.')
  };

  interpret? (request: InterpretRequest): Promise<InterpretResponse> {
    throw new Error('Method not implemented.')
  }

  interpretUrl? (request: InterpretRequest): string {
    throw new Error('Method not implemented.')
  }
}

export class InterpreterInfo {
  constructor (public langs: Set<string>, public name?: string, public url?: string) {
  }
}

export class InterpretRequest {
  constructor (public code: string, public lang?: string, public version?: string) {
  }
}

export class InterpretResponse {
  constructor (public output: string, public compilerOutpout?: string) {
  }
}

export default class ILangInterpretersService {
  get (name: string): Promise<ILangInterpreter | undefined> {
    throw new Error('Method not implemented.')
  }
}
