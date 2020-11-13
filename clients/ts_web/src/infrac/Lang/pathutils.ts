export function filename (path:string|undefined|null) {
  if (!path) {
    return
  }
  var idx = path.lastIndexOf('/')
  if (~idx) {
    return path.slice(idx + 1)
  }
  return path
}

export function rootname (path:string|undefined|null) {
  if (!path) {
    return
  }
  var idx = path.indexOf('/')
  if (~idx) {
    return path.slice(0, idx)
  }
  return path
}

export function extname (path:string|undefined|null) {
  if (!path) {
    return
  }
  var idx = path.lastIndexOf('.')
  if (~idx) {
    return path.slice(idx + 1)
  }
}
