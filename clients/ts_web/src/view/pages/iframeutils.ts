import { ApiInfo, generateContext, IFrameContext } from '../../infrac/components/IFrameWithJs'
import { srcToUrl } from '../../infrac/Lang/srcToUrl'
import { toJsDataStr } from '../../infrac/Lang/DataUtils'
import Article, { ArticleSection } from '../../domain/ServiceInterfaces/Article'
import ConfigKeys from '../../domain/ServiceInterfaces/ConfigKeys'
import IArticleAppservice from '../../app/Interfaces/IArticleAppservice'
import IConfigsService from '../../domain/ServiceInterfaces/IConfigsSercice'
import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../../app/Interfaces/IViewService'
import Seperators from '../../domain/ServiceInterfaces/Seperators'

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
  }]
})

export interface IFramework{
  html?:string;
  css?:string;
  js?:string;
}

export interface IData{
  contentUrl?:string;
  jsContentUrl?:string;
  hasData?:boolean;
  context?:IFrameContext;
}

const fwnameIsFw = 'self'

type FwBuilderArgs = {ns:string, locator:IServicesLocator }

export const EmbededFrameworks = {
  Storage: 'storage',
  FileService: '$fileservice'
}

const allEmdebdedFws: Map<string, {(args:FwBuilderArgs):ApiInfo[]}> = new Map([
  [EmbededFrameworks.Storage, ({ ns }:FwBuilderArgs):ApiInfo[] => {
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
  [EmbededFrameworks.FileService, ({ locator }:FwBuilderArgs):ApiInfo[] => ([{
    name: '$fileservice',
    methods: [
      {
        name: 'openFile',
        handler: (mimeType:string, resultType:string) => new Promise(resolve => {
          const viewService = locator.locate(IViewService)
          const langs = locator.locate(ILangsService)
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
  ]])

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

export const buildIframeData = async (locator:IServicesLocator, id:string, sections: Map<string, ArticleSection>, defaultFws :string[] = [], apiInfos:ApiInfo[]): Promise<IData> => {
  const frameworks = sections.get('frameworks')?.content
  let fwNames = Array.from(new Set(defaultFws.concat(frameworks ? Seperators.seperateItems(frameworks) : [])))
  if (~fwNames.findIndex(s => s === fwnameIsFw)) {
    return {}
  }

  const emdebdedFws = new Map(fwNames.filter(s => allEmdebdedFws.has(s)).map(s => [s, allEmdebdedFws.get(s)!]))
  if (emdebdedFws.size) {
    fwNames = fwNames.filter(s => !emdebdedFws.has(s))
  }
  const url = sections.get('url')?.content || ''
  const html = url ? (await tryGetContent(url)) : sections.get('html')?.content || ''
  if (url) {
    const ds = sections.get('data')
    sections = new Map()
    if (ds) {
      sections.set('data', ds)
    }
    fwNames = []
    // apiInfos = []
  }

  let fws : {name:string, fw?:IFramework}[] = []
  if (fwNames) {
    const articleService = locator.locate(IArticleAppservice)
    const configsService = locator.locate(IConfigsService)
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
  let hasData = false
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
  let jsContent = ''
  if (jsData) {
    jsContent += `<script>\nwindow.appData=${jsData}\n</script>\n`
    hasData = true
  }

  let context: IFrameContext | undefined
  let jsc = ''
  apiInfos = Array.from(emdebdedFws, ([_, build]) => build({ ns: id, locator })).flat().concat(apiInfos)
  if (~emdebdedFws) {
    [context, jsc] = generateContext(apiInfos, id)
    jsContent += `<script>\n${jsc}\n</script>\n`
  }

  if (fwJs && fwJs.length) {
    jsContent += `<script>\n${fwJs.join('\n')}\n</script>`
  }

  if (script) {
    jsContent += `<script>\n${script}\n</script>\n`
  }

  jsContent = `${jsContent}\n${content}`

  return { contentUrl: srcToUrl(content), jsContentUrl: jsContent ? srcToUrl(jsContent) : undefined, hasData, context }
}
