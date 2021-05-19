import { extname } from '../../infrac/Lang/pathutils'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IEditorsService, { EditorInfo } from '../Interfaces/IEditorsService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

const PathConfigKeys = {
  [ConfigKeys.EDITOR_TYPES]: ConfigKeys.EDITORS_PATH,
  [ConfigKeys.INTERPRETER_TYPES]: ConfigKeys.INTERPRETERS_PATH,
  [ConfigKeys.VIEWER_TYPES]: ConfigKeys.VIEWER_PATH
}

export default class EditorsServiceSingleton extends IServicesLocator implements IEditorsService {
  _allTypes = new Map<string, EditorInfo[]>()
  _basePaths = new Map<string, string>()

  async getBase (group:string): Promise<string> {
    if (!this._basePaths.has(group)) {
      this._basePaths.set(group, await this.locate(IConfigsService).getValueOrDefault(PathConfigKeys[group]))
    }
    return this._basePaths.get(group)!
  }

  async init ():Promise<void> {
    await this.fetchTypes(ConfigKeys.VIEWER_TYPES)
    await this.fetchTypes(ConfigKeys.INTERPRETER_TYPES)
    await this.fetchTypes(ConfigKeys.EDITOR_TYPES)
  }

 fetchTypes = async (group:string) :Promise<void> => {
   const cfgStr = await this.locate(IConfigsService).getValueOrDefault(group)
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
   this._allTypes.set(group, types)
 }

 getTypes (group:string):EditorInfo[] {
   return this._allTypes.get(group)!
 }

 getType (group:string, name:string): EditorInfo|undefined {
   const ext = extname(name)
   if (!ext) {
     return
   }

   const viewerTypes = this.getTypes(group)
   return viewerTypes.find(t => t.accept.test(ext || ''))
 }

 getEditorByFileName (name:string): EditorInfo|undefined {
   return this.getType(ConfigKeys.EDITOR_TYPES, name)
 }

 getInterpreterByFileName (name:string): EditorInfo|undefined {
   return this.getType(ConfigKeys.INTERPRETER_TYPES, name)
 }

 getViewerByFileName (name:string): EditorInfo|undefined {
   return this.getType(ConfigKeys.VIEWER_TYPES, name) || this.getEditorByFileName(name)
 }

 getEditorByName (name:string):EditorInfo|undefined {
   return this.getTypes(ConfigKeys.EDITOR_TYPES)?.find(i => i.name === name)
 };

 getViewerByName (name:string):EditorInfo|undefined {
   return this.getTypes(ConfigKeys.VIEWER_TYPES)?.find(i => i.name === name)
 }

 getEditors (): EditorInfo[] {
   return this.getTypes(ConfigKeys.EDITOR_TYPES)
 }

 getViewers (): EditorInfo[] {
   return this.getTypes(ConfigKeys.VIEWER_TYPES)
 }
}
