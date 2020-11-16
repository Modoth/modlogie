import { Pager } from './pager.js'
import { ResizeWatcher } from '../commons/resize-watcher.js'
import { TextRender } from './text-render.js'

export class TextRenderManager {
  constructor (value, reader) {
    this.value = value
    this.reader = reader
    try {
      this.storage_ = window.$localStorage || window.localStorage
    } catch {
      this.storage_ = {
        getItem: () => '',
        setItem: () => true
      }
    }
    this.currentPageIdx = 0
    this.lastPagedOffset = 0
    this.lastPagedPage = 0
    this.resizeWatcher = new ResizeWatcher()
    const tryReload = () => {
      if (this.container) {
        this.reload()
      }
    }
    this.resizeWatcher.register(tryReload)
  }

  async pageUp () {
    await this.loadPage(this.currentPageIdx - 1)
  }

  async pageDown () {
    await this.loadPage(this.currentPageIdx + 1)
  }

  async loadPage (pageIdx) {
    const page = await this.pager.getPage(pageIdx)
    if (page) {
      this.currentPageIdx = pageIdx
      this.currentOffset = page.offset
      this.render.rend(this.pager.getValue(), page.offset, page.nextOffset)
      if (this.fileName) {
        this.storage_.setItem(`${this.fileName}_offset`, this.currentOffset)
      }
    }
  }

  async reload () {
    this.currentPageIdx = 0
    const style = window.getComputedStyle(this.container)
    this.currentTheme = { fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000' }
    this.render.setStyle(this.currentTheme)
    this.pager.reset(this.currentOffset)
    await this.loadPage(0)
  }

  async connect (newContainer) {
    if (this.container === newContainer) {
      return
    }
    if (this.container) {
      this.container.onclick = null
    }
    this.container = newContainer
    const { container } = this
    if (!container) {
      return
    }
    container.innerHTML = ''
    const render = new TextRender(container)
    this.render = render
    this.pager = new Pager(this.value, this.reader, this.render)
    this.fileName = this.reader ? (await this.reader.name()) : undefined
    this.fileSize = this.reader ? (await this.reader.size()) : this.value.length
    this.currentOffset = 0
    if (this.fileName) {
      const offset = await this.storage_.getItem(`${this.fileName}_offset`) || 0
      this.currentOffset = Math.min(
        parseInt(offset) || 0,
        this.fileSize
      )
    }
    this.reload()
  }

  dispose () {
    this.resizeWatcher.dispose()
  }
}
