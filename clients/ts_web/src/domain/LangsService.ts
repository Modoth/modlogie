import ILangsService, { LangKeys } from './ILangsService'

export default class LangsService implements ILangsService {
  private langs: { [key: string]: string }
  public async load(...langs: { [key: string]: string }[]) {
    const remoteLangs = null as any;
    if (langs) {
      this.langs = Object.assign({}, remoteLangs, ...langs)
    } else {
      this.langs = remoteLangs
    }
  }

  public get(name: string): string {
    const key = name.toString()
    return this.langs[key] || key
  }

  public getConfig(name: string): string {
    if (name.indexOf(':') < 0) {
      return this.get(name);
    }
    const [prefix, key] = name.split(':');
    return `${prefix}:${this.langs[key] || key}`;
  }
}
