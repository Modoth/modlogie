import IKeywordsService from '../../domain/ServiceInterfaces/IKeywordsService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import INavigationService from '../Interfaces/INavigationService'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IViewService from '../Interfaces/IViewService'
import sleep from '../../infrac/Lang/sleep'

export default class NavigationService extends IServicesLocator implements INavigationService {
  async promptGoto (title?: string, url?: string): Promise<void> {
    if (!url || !title) {
      return
    }
    let async: boolean | undefined
    let desc = ''
    if (title) {
      const ltitle = title.toLocaleLowerCase()
      if (ltitle.startsWith('http://') || ltitle.startsWith('https://')) {
        url = title
      }
    }
    if (!url || url === window.origin || url === `${window.origin}/`) {
      const keywordsService = this.locate(IKeywordsService)
      await Promise.all([
        sleep(200).then(() => {
          if (async === undefined) {
            async = true
          }
        }),
        keywordsService.get(title).then((s) => {
          url = s.efficialUrl
          desc = s.description || ''
          if (async === undefined) {
            async = false
          }
        })
      ])
    }
    const u = new URL(url || '')
    const newTab = u.hostname !== window.location.hostname
    const articleView = !newTab && u.hash.startsWith('#/article/')
    const articlePath = articleView ? decodeURIComponent(u.hash.slice('#/article'.length)) : undefined
    const open = () => {
      if (!url) {
        return
      }
      if (!newTab) {
        window.location.href = url!
      } else {
        window.open(url, '_blank')
      }
    }
    if ((async && newTab) || desc || articlePath) {
      this.locate(IViewService).prompt(
        url ? { title, subTitle: this.locate(ILangsService).get(LangKeys.ComfireJump) + url } : title, [
          ...(desc ? [{
            type: 'Markdown',
            value: desc
          }] : (articlePath ? [{
            type: 'Article',
            value: articlePath
          }] : []))
        ], async () => {
          open()
          return true
        })
    } else {
      open()
    }
  }
}
