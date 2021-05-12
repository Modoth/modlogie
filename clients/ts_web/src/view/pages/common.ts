export function generateRandomStyle () {
  const colors = 6
  return `random-color-${Math.floor(Math.random() * colors)}`
}
