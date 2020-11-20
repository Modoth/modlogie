export type FieldInfo<TItem> = {name:string, get(item:TItem):any}

export default class IItemsExporter<TExportOpt> {
  get ext ():string {
    throw new Error('Method not implemented')
  }

  export<TItem> (name:string, items:TItem[], fields:FieldInfo<TItem>[], opt:TExportOpt):Promise<ArrayBuffer> {
    throw new Error('Method not implemented')
  }
}
