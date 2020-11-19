export type FieldInfo<TItem> = {name:string, get(item:TItem):any}

export default class IItemsExporter {
  get ext ():string {
    throw new Error('Method not implemented')
  }

  export<TItem> (items:TItem[], fields:FieldInfo<TItem>[]):Promise<ArrayBuffer> {
    throw new Error('Method not implemented')
  }
}
