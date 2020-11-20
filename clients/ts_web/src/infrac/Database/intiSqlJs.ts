import { SqlJs } from 'sql.js/module'
// eslint-disable-next-line import/no-webpack-loader-syntax
require('script-loader!sql.js')

let initsql :Promise<SqlJs.SqlJsStatic>
const initSql = () :Promise<SqlJs.SqlJsStatic> => {
  if (!initsql) {
    initsql = (window as any).initSqlJs({
      locateFile: (file:string) => `https://sql.js.org/dist/${file}`
    })
  }
  return initsql
}

export default initSql
