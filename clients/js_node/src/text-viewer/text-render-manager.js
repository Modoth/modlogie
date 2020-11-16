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
      this.currentOffset = page.offset
      this.render.rend(this.pager.getValue(), page.offset, page.nextOffset)
      if (this.fileName) {
        this.storage.setItem(`${this.fileName}_offset`, this.currentOffset)
      }
    }
  }

  async reloadCurrent () {
    this.currentPageIdx = 0
    const style = window.getComputedStyle(this.container)
    const theme = { fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000' }
    this.render.setStyle(theme)
    this.pager.reset(this.currentOffset)
    await this.loadPage()
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
    this.fileSize = await this.reader.size()
    this.currentOffset = 0
    if (this.fileName) {
      const offset = await this.storage.getItem(`${this.fileName}_offset`) || 0
      this.currentOffset = Math.min(
        parseInt(offset) || 0,
        this.fileSize
      )
    }
    this.reloadCurrent()
  }
}
