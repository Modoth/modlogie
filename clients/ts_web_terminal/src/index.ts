import { App } from "./App"
const searchParams = new URLSearchParams(location.search)
const app = new App(({
    lang: searchParams.get('lang') || undefined,
    version: searchParams.get('version') || undefined,
    code: searchParams.get('code') || undefined,
}));
(window as any).app = app;
app.start()
export default {}