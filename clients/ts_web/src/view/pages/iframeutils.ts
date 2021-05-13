import { ApiInfo, FullScreenApiInfo, generateContext, IFrameContext } from '../../infrac/components/IFrameWithJs'
import { LocateFunction } from '../../infrac/ServiceLocator/IServicesLocator'
import { toJsDataStr } from '../../infrac/Lang/DataUtils'
import Article, { ArticleSection } from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import Seperators from '../../domain/ServiceInterfaces/Seperators'
import pako from 'pako'

const copyFileInfo = (file:File) => {
  return {
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type
  }
}

export const genetateFileApi = (file:IFile):ApiInfo => ({
  name: '$file',
  methods: [{
    name: 'size',
    handler: async () => {
      return file.size()
    }
  },
  {
    name: 'seek',
    handler: async (start:number) => {
      return file.seek(start)
    }
  }, {
    name: 'name',
    handler: async () => {
      return file.name()
    }
  },
  {
    name: 'read',
    handler: async (buffSize:number) => {
      return file.read(buffSize)
    }
  },
  {
    name: 'readAsBase64',
    handler: async(compress: boolean) =>{
      const res = await file.read()
      let data = new Uint8Array(res[0])
      if(compress){
        data = pako.deflate(data)
      }
      return btoa(String.fromCharCode(...data))
    }
  }
]
})

export interface IFramework{
  html?:string;
  css?:string;
  js?:string;
}

export interface IData{
  docWithoutJs?:string;
  doc?:string;
  contextWithoutJs?:IFrameContext;
  context?:IFrameContext;
}

const fwnameIsFw = 'self'

type FwBuilderArgs = {id:string, locate: LocateFunction, reload():any }

export const EmbededFrameworks = {
  Storage: 'storage',
  FileService: '$fileservice',
  Location: '$location',
  Zip: '$zip'
}

const allEmbededFws: Map<string, {(args:FwBuilderArgs):ApiInfo[]}> = new Map([
  [EmbededFrameworks.Storage, ({ id: ns }:FwBuilderArgs):ApiInfo[] => {
    const getSecureKey = (key: string) => `H5Apps_${ns}_${key}`
    return [
      {
        name: '$sessionStorage',
        methods: [
          {
            name: 'getItem',
            handler: (key:string) => window.sessionStorage.getItem(getSecureKey(key))
          },
          {
            name: 'setItem',
            handler: (key:string, value:string) => window.sessionStorage.setItem(
              getSecureKey(key),
              value
            )
          }
        ]
      }, {
        name: '$localStorage',
        methods: [
          {
            name: 'getItem',
            handler: (key:string) => window.localStorage.getItem(getSecureKey(key))
          },
          {
            name: 'setItem',
            handler: (key:string, value:string) => window.localStorage.setItem(
              getSecureKey(key),
              value
            )
          }
        ]
      }
    ]
  }],
  [EmbededFrameworks.FileService, ({ locate }:FwBuilderArgs):ApiInfo[] => ([{
    name: EmbededFrameworks.FileService,
    methods: [
      {
        name: 'openFile',
        handler: (mimeType:string, resultType:string) => new Promise(resolve => {
          const viewService = locate(IViewService)
          const langs = locate(ILangsService)
          viewService.prompt(
            langs.get(LangKeys.Import),
            [
              {
                type: 'File',
                value: null,
                accept: mimeType
              }
            ],
            async (file: File) => {
              (() => {
                const reader : FileReader & {[key:string]:Function} = new FileReader() as any
                const readAs = `readAs${resultType || 'ArrayBuffer'}`
                if (!reader[readAs]) {
                  resolve({ file: copyFileInfo(file) })
                  return
                }
                reader.onabort = () => resolve(null)
                reader.onerror = () => resolve(null)
                reader.onload = () => {
                  resolve({
                    file: copyFileInfo(file),
                    data: reader.result
                  })
                }
                reader[readAs](file)
              })()
              return true
            }, false)
        })
      }
    ]
  }])
  ],
  [FullScreenApiInfo.name, (_:FwBuilderArgs) => [FullScreenApiInfo]],
  [EmbededFrameworks.Location, ({ reload }:FwBuilderArgs) => [{
    name: EmbededFrameworks.Location,
    methods: [
      {
        name: 'reload',
        handler: () => new Promise(resolve => {
          resolve(reload())
        })
      }
    ]
  }]]
]
)

const converter = async (article:Article):Promise<IFramework> => {
  const sections = new Map(article?.content?.sections?.map(s => [s.name!, s]))
  const html = sections.get('html')?.content
  const css = sections.get('css')?.content
  const js = sections.get('js')?.content
  return { html, css, js }
}

const tryGetContent = async (url:string):Promise<string> => {
  try {
    return await (await fetch(url, { mode: 'cors' })).text()
  } catch {
    console.log(`Fetch url failed ${url}`)
    return ''
  }
}

export type BuildIFrameDataArgs = { defaultFws :string[], apiInfos:ApiInfo[]} & FwBuilderArgs

export const buildIframeData = async (sections: Map<string, ArticleSection>, { locate, id, defaultFws, apiInfos, reload }:BuildIFrameDataArgs): Promise<IData> => {
  const frameworks = sections.get('frameworks')?.content
  let fwNames = Array.from(new Set(defaultFws.concat(frameworks ? Seperators.seperateItems(frameworks) : [])))
  if (~fwNames.findIndex(s => s === fwnameIsFw)) {
    return {}
  }

  const embededFws = new Map(fwNames.filter(s => allEmbededFws.has(s)).map(s => [s, allEmbededFws.get(s)!]))
  const forceEmbededFws : typeof embededFws = new Map()
  if (embededFws.size) {
    fwNames = fwNames.filter(s => !embededFws.has(s))
  }
  const url = sections.get('url')?.content || ''
  let html = sections.get('html')?.content || ''
  if (url) {
    html = (await tryGetContent(url)) || ''
    forceEmbededFws.set(EmbededFrameworks.Location, allEmbededFws.get(EmbededFrameworks.Location)!)
    embededFws.set(EmbededFrameworks.Location, allEmbededFws.get(EmbededFrameworks.Location)!)
  }

  if (url) {
    const dataSection = sections.get('data')
    sections = new Map()
    if (dataSection) {
      sections.set('data', dataSection)
    }
    fwNames = []
  }

  let fws : {name:string, fw?:IFramework}[] = []
  if (fwNames) {
    const articleService = locate(IArticleAppservice)
    const configsService = locate(IConfigsService)
    const fwBase = await configsService.getValueOrDefault(ConfigKeys.FRAMEWORKS_PATH)
    const getFwPath = (name:string) => `${fwBase}/${name}`
    const fwsCache = fwBase
    fws = await Promise.all(fwNames.map(name =>
      articleService.getCacheOrFetch(fwsCache, getFwPath(name), converter).then(fw => ({ name, fw }))))
    const missingFws = fws.filter(f => !f.fw).map(f => f.name)
    if (missingFws.length) {
      console.log('Missing frameworks:', missingFws)
      return {}
    }
  }
  const fwHtml = fws && fws.map(f => f.fw?.html).filter(s => s)
  const fwCss = fws && fws.map(f => f.fw?.css).filter(s => s)
  const fwJs = fws && fws.map(f => f.fw?.js).filter(s => s)
  if (!html && !(fwHtml && fwHtml.length)) {
    return {}
  }
  const style = sections.get('css')?.content
  const script = sections.get('js')?.content
  const data = sections.get('data')?.content
  const dataType = sections.get('data')?.type?.toLocaleLowerCase()
  let withData = false
  const jsData = toJsDataStr(dataType || 'yml', data)

  let content = ''
  if (fwHtml && fwHtml.length) {
    content += `${fwHtml.join('\n')}\n`
  }
  if (html) {
    content += html + '\n'
  }
  if (fwCss && fwCss.length) {
    content += `<style>\n${fwCss.join('\n')}\n$</style>\n`
  }
  if (style) {
    content += `<style>\n${style}\n$</style>\n`
  }
  let doc = ''
  if (jsData) {
    doc += `<script>\nwindow.appData=${jsData}\n</script>\n`
    withData = true
  }

  let context: IFrameContext | undefined
  let contextWithoutJs: IFrameContext | undefined
  if (embededFws.size) {
    let jsc = ''
    const embededApis = Array.from(embededFws, ([_, build]) => build({ id: id, locate, reload })).flat()
    ;[context, jsc] = generateContext(embededApis.concat(apiInfos), id)
    doc += `<script>\n${jsc}\n</script>\n`
  }
  let docWithoutJs = ''
  if (!withData) {
    docWithoutJs = content
    if (forceEmbededFws.size) {
      let jsc = ''
      const forcedApis = Array.from(forceEmbededFws, ([_, build]) => build({ id: id, locate, reload })).flat()
      ;[contextWithoutJs, jsc] = generateContext(forcedApis, id)
      docWithoutJs = `<script>\n${jsc}\n</script>\n${docWithoutJs}`
    }
  }

  if (fwJs && fwJs.length) {
    doc += `<script>\n${fwJs.join('\n')}\n</script>`
  }

  if (script) {
    doc += `<script>\n${script}\n</script>\n`
  }

  doc = `${doc}\n${content}`

  return { docWithoutJs, contextWithoutJs, doc, context }
}
