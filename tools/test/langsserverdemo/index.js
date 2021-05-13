const http = require('http')
const zlib = require('zlib')

// type ApiResult = { "Errors": string, "Events": { "Message": string, "Kind": "stdout" | "sterr", "Delay": number }[] }

// type ApiRequest = {code: string, lang?: string, version?: string }

const main = async () => {
    const server = http.createServer((req, res) => {
        const setCorsHeaders = (res) => {
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        }

        const resError = (res) => {
            res.statusCode = 200
            res.end(JSON.stringify({ Errors: "Invalid Code" }))
        }

        const resData = (res, data) => {
            let code, lang, version, template
            if (!data) {
                resError(res)
                return
            }
            try {
                const d = JSON.parse(data)
                code = d.code
                lang = d.lang
                version = d.version
                template = d.template
                if (!code || !lang) {
                    resError(res)
                    return
                }
            }
            catch {
                resError(res)
                return
            }
            const resp = { Errors: "", Events: [] }
            resp.Events.push(
                {
                    Message: code,
                    Kind: "stdout",
                    Delay: 0
                }
            )
            res.statusCode = 200
            res.end(JSON.stringify(resp))
        }

        if (req.method === 'OPTIONS') {
            res.statusCode = 200
            setCorsHeaders(res)
            res.end()
            return
        }
        if (req.method === "POST") {
            setCorsHeaders(res)
            req.on("error", () => {
                res.end()
            })
            let data = '';
            req.on("data", (d) => {
                data += d
            })
            req.on("end", () => {
                resData(res, data)
            })
            return
        }
        if (req.method === "GET") {
            setCorsHeaders(res)
            const pathname = req.url.split('?')[0]
            let base64 = pathname.slice(1)
            const c = Buffer.from(base64, 'base64')
            zlib.inflate(c, (e, d) => {
                if (e || !d) {
                    resError(res)
                } else {
                    resData(res, d.toString())
                }
            })
            return
        }
        res.writeHead(404, "NOT FOUND")
        res.end()
    })
    server.listen(8888, "0.0.0.0")
}

main()