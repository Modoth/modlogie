export const fitCanvas = async (canvas) => {
  if (canvas.width <= 0) {
    return
  }
  canvas.style.width = ''
  canvas.style.height = ''
  await new Promise((resolve) => setTimeout(resolve, 0))
  if (window.innerHeight > window.innerWidth) {
    let width = parseInt(getComputedStyle(canvas).width)
    let height = (width * canvas.height) / canvas.width
    canvas.style.height = Math.floor(height) + 'px'
  } else {
    let height = parseInt(getComputedStyle(canvas).height)
    let width = (height * canvas.width) / canvas.height
    canvas.style.width = Math.floor(width) + 'px'
  }
}
