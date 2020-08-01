export function generateRandomStyle(){
  const colors = 7;
  return `random-color-${Math.floor(Math.random()*colors)}`
}