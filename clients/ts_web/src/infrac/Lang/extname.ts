export function extname (path:string|undefined) {
  if (!path) {
    return
  }
  var idx = path.lastIndexOf('.')
  if (~idx) {
    return path.slice(idx + 1)
  }
}
