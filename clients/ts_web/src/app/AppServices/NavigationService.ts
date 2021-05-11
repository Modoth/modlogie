import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import INavigationService from '../Interfaces/INavigationService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../Interfaces/IViewService'

export default class NavigationService extends IServicesLocator implements INavigationService {
  async promptGoto (title?: string, url?: string): Promise<void> {
    if (!url || !title) {
      return
    }
    if (title) {
      const ltitle = title.toLocaleLowerCase()
      if (ltitle.startsWith('http://') || ltitle.startsWith('https://')) {
        url = title
      }
    }
    const u = new URL(url || '')
    const proto = u.protocol
    const lProto = proto.toLowerCase()
    if ((lProto === 'http:' || lProto === 'https:')) {
      if (u.hostname !== window.location.hostname) {
        // this.locate(IViewService).prompt(
        //   { title, subTitle: this.locate(ILangsService).get(LangKeys.ComfireJump) + url }, []
        //   , async () => {
        //     window.open(url, '_blank')
        //     return true
        //   })
        window.open(url, '_blank')
        return
      }
      window.location.href = url
      return
    }
    if (lProto === 'comment:') {
      this.locate(IViewService).prompt(
        title, [
          {
            type: 'Markdown',
            value: decodeURIComponent(u.pathname)
          }
        ])
      return
    }
    if (lProto) {
      var root:string|undefined = lProto.replace(/:$/, '')
      if (root === 'article') {
        root = undefined
      }
      let articlePathOrName = u.pathname
      if (!root) {
        if (articlePathOrName[0] !== '/') {
          articlePathOrName = '/' + articlePathOrName
        }
        url = `#/article${articlePathOrName}`
        this.locate(IViewService).prompt(
          { title, subTitle: this.locate(ILangsService).get(LangKeys.ComfireJump) + url }, [{
            type: 'Article',
            value: articlePathOrName
          }
          ], async () => {
            window.location.href = url!
            return true
          })
      } else {
        this.locate(IViewService).prompt(
          title, [{
            type: 'Article',
            value: { root, name: articlePathOrName }
          }
          ])
      }
    }
  }
}
