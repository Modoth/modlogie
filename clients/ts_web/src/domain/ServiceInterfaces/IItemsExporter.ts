export type FieldInfo<TItem> = {name:string, get(item:TItem):[string|undefined, ExportResource[]|undefined]}
export type ExportResource = {name:string, path: string}
export default class IItemsExporter<TExportOpt> {
  get ext ():string {
    throw new Error('Method not implemented')
  }

  export<TItem> (name:string, items:TItem[], fields:FieldInfo<TItem>[], opt:TExportOpt):Promise<ArrayBuffer> {
    throw new Error('Method not implemented')
  }
}
