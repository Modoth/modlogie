import { extname } from '../../infrac/Lang/pathutils'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IEditorsService, { EditorInfo } from '../Interfaces/IEditorsService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import Seperators from '../../domain/ServiceInterfaces/Seperators'
import { debug } from 'console'

const PathConfigKeys = {
  [ConfigKeys.EDITOR_TYPES]: ConfigKeys.EDITORS_PATH,
  [ConfigKeys.VIEWER_TYPES]: ConfigKeys.VIEWER_PATH
}

export default class EditorsServiceSingleton extends IServicesLocator implements IEditorsService {
  _allTypes = new Map<string, Promise<EditorInfo[]>>()
  _basePaths = new Map<string, Promise<string>>()

  getBase (group:string):Promise<string> {
    if (!this._basePaths.has(group)) {
      this._basePaths.set(group, this.locate(IConfigsService).getValueOrDefault(PathConfigKeys[group]))
    }
    return this._basePaths.get(group)!
  }

 fetchTypes = async (configs:IConfigsService, group:string) :Promise<EditorInfo[]> => {
   const cfgStr = await configs.getValueOrDefault(group)
   const types :EditorInfo[] = []
   const base = await this.getBase(group)
   for (let str of Seperators.seperateItems(cfgStr)) {
     str = str.trim()
     if (!str) {
       continue
     }
     let [name, regStr] = Seperators.seperateFields(str)
     name = name.trim()
     regStr = regStr.trim()
     if (!name || !regStr) {
       continue
     }
     try {
       types.push({ name, path: `${base}/${name}`, accept: new RegExp(regStr, 'i') })
     } catch (e) {
       console.log('invalid config', cfgStr, str)
     }
   }
   return types
 }

 async getTypes (group:string):Promise<EditorInfo[]> {
   if (!this._allTypes.has(group)) {
     this._allTypes.set(group, this.fetchTypes(this.locate(IConfigsService), group))
   }
   return await this._allTypes.get(group)!
 }

 async getType (group:string, name:string): Promise<EditorInfo | undefined> {
   const ext = extname(name)
   if (!ext) {
     return
   }

   const viewerTypes = await this.getTypes(group)
   return viewerTypes.find(t => t.accept.test(ext || ''))
 }

 async getEditorByFileName (name:string): Promise<EditorInfo | undefined> {
   return await this.getType(ConfigKeys.EDITOR_TYPES, name)
 }

 async getViewerByFileName (name:string): Promise<EditorInfo | undefined> {
   return await this.getType(ConfigKeys.VIEWER_TYPES, name) || await this.getEditorByFileName(name)
 }

 async getEditorByName (name:string):Promise<EditorInfo|undefined> {
   return (await this.getTypes(ConfigKeys.EDITOR_TYPES)).find(i => i.name === name)
 };

 async getViewerByName (name:string):Promise<EditorInfo|undefined> {
   return (await this.getTypes(ConfigKeys.VIEWER_TYPES)).find(i => i.name === name)
 }

 getEditors (): Promise<EditorInfo[]> {
   return this.getTypes(ConfigKeys.EDITOR_TYPES)
 }

 getViewers (): Promise<EditorInfo[]> {
   return this.getTypes(ConfigKeys.VIEWER_TYPES)
 }
}
