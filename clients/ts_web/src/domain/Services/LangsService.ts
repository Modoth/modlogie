import ILangsService from '../ServiceInterfaces/ILangsService'
import Seperators from '../ServiceInterfaces/Seperators'

export default class LangsService implements ILangsService {
  private langs: { [key: string]: string }
  async load (...langs: { [key: string]: string }[]) {
    const remoteLangs = null as any
    if (langs) {
      this.langs = Object.assign({}, remoteLangs, ...langs)
    } else {
      this.langs = remoteLangs
    }
  }

  get (name: string): string {
    const key = name?.toString()
    return this.langs[key] || key
  }

  getConfig (name: string): string {
    if (name.indexOf(Seperators.LangFields) < 0) {
      return this.get(name)
    }
    const [prefix, key] = Seperators.seperateLangFields(name)
    return `${prefix}:${this.langs[key] || key}`
  }
}
