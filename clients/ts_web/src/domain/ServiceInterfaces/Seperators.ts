const getSeperator = (sep:string) => (value:string|undefined|null) => !value ? [] : value.split(sep).map(s => s.trim()).filter(s => s)
const getJoin = (sep:string) => (items:readonly string[]) => items.join(sep)
const fields = {
  Items: ';',
  Fields: ',',
  LangFields: ':'
}
const methods = {
  seperateItems: getSeperator(fields.Items),
  seperateFields: getSeperator(fields.Fields),
  seperateLangFields: getSeperator(fields.LangFields),
  joinItems: getJoin(fields.Items),
  joinFields: getJoin(fields.Fields),
  joinLangFields: getJoin(fields.LangFields)
}

const Seperators = Object.assign({}, fields, methods)

export default Seperators
