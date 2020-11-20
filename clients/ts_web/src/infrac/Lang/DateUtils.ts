/* eslint-disable camelcase */
export const yyyyMMdd_HHmmss = (date:Date):string => {
  return `${date.getFullYear()}${date.getMonth()}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}`
}
