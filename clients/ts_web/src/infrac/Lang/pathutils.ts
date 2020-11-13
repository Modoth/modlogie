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
  return path.split('/').find(s => s)
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
