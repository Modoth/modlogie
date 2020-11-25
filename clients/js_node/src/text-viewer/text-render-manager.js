import { Pager } from './pager.js'
import { TextReader } from './text-reader.js'
import { TextRender } from './text-render.js'

export class TextRenderManager {
  constructor (storage, resizeWatcher) {
    this.storage = storage
    this.currentPageIdx = 0
    this.lastPagedOffset = 0
    this.lastPagedPage = 0
    const tryReload = () => {
      if (this.container) {
        this.reloadCurrent()
      }
    }
    resizeWatcher.register(tryReload)
  }

  async loadPage (pageIdx = 0) {
    const page = await this.pager.getPage(pageIdx)
    if (page) {
      this.currentPageIdx = pageIdx
      this.currentPosition = page.offset
      this.render.rend(this.pager.getValue(), page.offset, page.nextOffset)
      if (this.fileName) {
        this.storage.setItem(`${this.fileName}_offset`, this.currentPosition)
      }
    }
  }

  async jumpTo (pos = 0) {
    const defaultLastPageSize = 10
    pos = Math.min(
      parseInt(pos) || 0,
      Math.max(0, this.totalLength - defaultLastPageSize)
    )
    this.currentPosition = pos
    this.reloadCurrent()
  }

  async toogleTheme () {
    let idx = this.themes.findIndex((t) => t === this.currentTheme)
    idx = (idx + 1) % this.themes.length
    await this.setTheme(idx)
  }

  async setTheme (idx = 0) {
    this.currentTheme = this.themes[idx]
    await this.storage.setItem('theme', idx)
    document.body.style.background = this.currentTheme.background
    this.render.setStyle(this.currentTheme)
    this.pager.reset(this.currentPosition)
    await this.loadPage()
  }

  async reloadCurrent () {
    this.currentPageIdx = 0
    const style = window.getComputedStyle(this.container)
    const theme = { fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000', background: 'transparent' }
    this.themes = [
      theme,
      {
        fontSize: theme.fontSize,
        color: 'darkslateblue',
        hightcolor: 'red',
        fontFamily: 'serif',
        background: '#f6f6e2'
      },
      {
        fontSize: theme.fontSize,
        color: '#eee',
        hightcolor: 'red',
        fontFamily: 'serif',
        background: '#333'
      }
    ]
    const currentThemeIdx = (parseInt(await this.storage.getItem('theme')) || 0) % this.themes.length
    this.setTheme(currentThemeIdx)
  }

  async pageUp () {
    if (!this.reader) {
      return
    }
    await this.loadPage(this.currentPageIdx - 1)
  }

  async pageDown () {
    if (!this.reader) {
      return
    }
    await this.loadPage(this.currentPageIdx + 1)
  }

  async loadTo (file, container) {
    this.reader = new TextReader(file)
    this.container = container
    if (!this.container) {
      return
    }
    this.container.innerHTML = ''
    this.render = new TextRender(this.container)
    this.pager = new Pager(this.reader, this.render)
    this.fileName = await this.reader.name()
    this.totalLength = await this.reader.size() / 2
    const currentPosition = this.fileName ? await this.storage.getItem(`${this.fileName}_offset`) || 0 : 0
    this.jumpTo(currentPosition)
  }
}
