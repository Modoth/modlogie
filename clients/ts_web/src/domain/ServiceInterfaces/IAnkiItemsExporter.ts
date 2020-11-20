import IItemsExporter from './IItemsExporter'

export type AnkiTemplate = {front:string, back:string, css:string}

export default class IAnkiItemsExporter extends IItemsExporter<AnkiTemplate> {

}
