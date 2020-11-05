export const fetchFileSize = async (url: string) => {
    const res = await fetch(url, { method: "HEAD" })
    const lenStr = res.headers.get('Content-Length')
    return parseInt(lenStr || '0') || 0;
}

export const fetchFileRange = async (url: string, start: number, end: number) => {
    const res = await fetch(url, { headers: { Range: `bytes=${start}-${end}` } })
    const buff = await res.arrayBuffer()
    return buff;
}