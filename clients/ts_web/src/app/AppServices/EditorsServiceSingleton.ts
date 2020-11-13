import { extname } from '../../infrac/Lang/pathutils'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IEditorsService from '../Interfaces/IEditorsService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

interface ViewerType {
  name:string;
  accept:RegExp
}

export default class EditorsServiceSingleton extends IServicesLocator implements IEditorsService {
   allTypes = new Map<string, Promise<ViewerType[]>>()

 fetchTypes = async (configs:IConfigsService, cfg:string) :Promise<ViewerType[]> => {
   const cfgStr = await configs.getValueOrDefault(cfg)
   const types :ViewerType[] = []
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
       types.push({ name, accept: new RegExp(regStr, 'i') })
     } catch (e) {
       console.log('invalid config', cfgStr, str)
     }
   }
   return types
 }

 async getType (config:string, name:string): Promise<string | undefined> {
   const ext = extname(name)
   if (!ext) {
     return
   }
   if (!this.allTypes.has(config)) {
     this.allTypes.set(config, this.fetchTypes(this.locate(IConfigsService), config))
   }

   const viewerTypes = await this.allTypes.get(config)!
   return viewerTypes.find(t => t.accept.test(ext || ''))?.name
 }

 async getEditorType (name:string): Promise<string | undefined> {
   return await this.getType(ConfigKeys.EDITOR_TYPES, name)
 }

 async getViewerType (name:string): Promise<string | undefined> {
   return await this.getType(ConfigKeys.VIEWER_TYPES, name) || await this.getEditorType(name)
 }
}
