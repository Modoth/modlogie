const http = require('http')

// type ApiResult = { "Errors": string, "Events": { "Message": string, "Kind": "stdout" | "sterr", "Delay": number }[] }

// type ApiRequest = {code: string, lang?: string, version?: string }

const main = async () => {
    const server = http.createServer((req, res) => {
        const setCorsHeaders = (res) =>{
            res.setHeader("Access-Control-Allow-Origin", "*")
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
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
                let code, lang, version, template
                let invalidData = false
                try {
                    const d = JSON.parse(data)
                    code = d.code
                    lang = d.lang
                    version = d.version
                    template = d.template
                    if (!code || !lang) {
                        invalidData = true
                    }
                }
                catch {
                    invalidData = true
                }
                const resp = {Errors:"", Events:[]}
                if(invalidData){
                    resp.Errors = "Invalid Code"
                }else{
                    resp.Events.push(
                        {
                            Message: code,
                            Kind: "stdout",
                            Delay: 0
                        }
                    )
                }
                res.statusCode = 200
                res.end(JSON.stringify(resp))
            })
            return
        }
        res.writeHead(404, "NOT FOUND")
        res.end()
    })
    server.listen(8888, "0.0.0.0")
}

main()