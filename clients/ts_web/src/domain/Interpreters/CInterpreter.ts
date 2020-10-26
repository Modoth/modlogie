import { ILangInterpreter, InterpreterInfo, InterpretRequest, InterpretResponse } from "../ILangInterpretersService"

export class CInterpreter implements ILangInterpreter {
    _info = new InterpreterInfo(new Set(["c"]), "Powered by Coliru", "http://coliru.stacked-crooked.com")
    get info(): InterpreterInfo {
        return this._info;
    };
    interpret(request: InterpretRequest): Promise<InterpretResponse> {
        return new Promise(resolve => {
            const versionReg = /^\/\*\s*cc:\s*std=(\S+?)\s/
            const versionMatch = request.code.match(versionReg)
            const version = versionMatch?.[1]
            const url = "https://coliru.stacked-crooked.com/compile";
            const req = new XMLHttpRequest();
            req.onabort = () => resolve(new InterpretResponse(""))
            req.onerror = () => resolve(new InterpretResponse(""))
            req.onload = () => {
                const res = req.response as string;
                var match = res.match(/main\.cpp:(\d+?):(\d+?): error: (.*)$/m);
                if (match) {
                    resolve(new InterpretResponse("", match[3]))
                }
                resolve(new InterpretResponse(res));
            }
            req.open("POST", url, true);
            const cmd = `gcc ${version ? '-std=' + version : ''} main.cpp && ./a.out`
            const src = '#include <stdio.h>\nint main(){' + request.code + '\n return 0;\n}'
            req.send(JSON.stringify({ cmd, src }));
        })

    }
}