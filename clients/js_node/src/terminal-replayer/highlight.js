export const highlight = (/** @type string */ content) => {
  const results = []
  const lines = content.split('\n')
  let prefix
  for (let line of lines) {
    const match = line.match(/^([\$#]|(?:PS.*?>)|(?:>>>)|(?:>))(\s+)(\w+)?(.*)/)
    if (!match) {
      results.push(line)
      continue
    }
    prefix = `\u{1b}[34m${match[1]}\u{1b}[0m${match[2]}\u{1b}[5m`
    line = `${prefix}\u{1b}[32m${match[3] || ''}\u{1b}[0m${match[4]}\u{1b}[25m`
    line = line.replace(
      /\|\s?\w+/g,
      (s) => `\u{1b}[34m${s[0]}\u{1b}[0m\u{1b}[32m${s.slice(1)}\u{1b}[0m`
    )
    line = line.replace(/(\$\w+)/g, (s) => `\u{1b}[31m${s}\u{1b}[0m`)
    results.push(line)
  }
  prefix && results.push(prefix)
  return results.join('\n')
}
