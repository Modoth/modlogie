export function generateRandomStyle(id: string, magicSeed: number) {
  const totalStyleCount = 6
  return `random-color-${(getSimpleStringHash(id, magicSeed)+magicSeed)%totalStyleCount}`
}

export function getSimpleStringHash(s: string, r: number) {
  let hash = s.length
  hash += s.charCodeAt(s.length -1 )
  hash += s.charCodeAt(0)
  hash += s.charCodeAt(r % s.length)
  return hash;
}