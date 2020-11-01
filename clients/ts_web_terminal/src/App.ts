export interface Params {
    lang?: string,
    version?: string,
    code?: string
}

export class App {
    constructor(public params: Params) { }

    async start(): Promise<void> {
        document.write(this.params.code || '')
    }
}