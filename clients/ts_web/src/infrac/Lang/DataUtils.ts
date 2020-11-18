import YAML from 'yaml'

export const toJsDataStr = (dataType?:string, data?:string) => {
  if (data) {
    try {
      switch (dataType) {
        case 'json':
          return JSON.stringify(JSON.parse(data))
        case 'yml':
        case 'yaml':
          return JSON.stringify(YAML.parse(data))
        default:
          return JSON.stringify(data)
      }
    } catch (e) {
      console.log(e)
    }
  }
}

export const toJsObj = (dataType?:string, data?:string):object => {
  if (data) {
    try {
      switch (dataType) {
        case 'json':
          return JSON.parse(data)
        case 'yml':
        case 'yaml':
          return YAML.parse(data)
        default:
          return {}
      }
    } catch (e) {
      return {}
    }
  }
  return {}
}
