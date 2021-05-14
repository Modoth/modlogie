export function generateRandomStyle(id: string, magicSeed: number) {
  const totalStyleCount = 6
  return `random-color-${(getSimpleStringHash(id)+magicSeed)%totalStyleCount}`
}

export function getSimpleStringHash(s: string) {
  const maxStep = 100
  const range = Math.ceil(s.length / maxStep)
  let hash = 0
  for (let i = 0; i < s.length; i += range) {
    hash += s.charCodeAt(i)
  }
  return hash;
}