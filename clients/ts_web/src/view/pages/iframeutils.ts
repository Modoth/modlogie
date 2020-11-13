import IFile from '../../infrac/Lang/IFile'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../../app/Interfaces/IViewService'

export const generateFileService = (locator:IServicesLocator) => ({
  name: '$fileservice',
  methods: [
    {
      name: 'openFile',
      handler: (mimeType:string, resultType:string) => new Promise(resolve => {
        console.log('openfile')
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
              const reader = new FileReader() as any
              const readAs = `readAs${resultType}`
              if (!reader[readAs]) {
                resolve({ file: Object.assign({}, file) })
              }
              reader.onabort = () => resolve(null)
              reader.onerror = () => resolve(null)
              reader.onload = () => {
                resolve({
                  file: Object.assign({}, file),
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
})

export const genetateFileApi = (file:IFile) => ({
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
