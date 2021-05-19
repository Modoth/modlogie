export function generateRandomStyle (id: string, magicSeed: number) {
  const totalStyleCount = 6
  return `random-color-${(getSimpleStringHash(id, magicSeed) + magicSeed) % totalStyleCount}`
}

export function getSimpleStringHash (s: string, r: number) {
  const maxStep = 100
  const range = Math.ceil(s.length / maxStep)
  let hash = s.length
  for (let i = 0; i < s.length; i += range) {
    hash += s.charCodeAt(i)
  }
  hash += s.charCodeAt(r % s.length)
  return hash
}
