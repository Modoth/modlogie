import { Modal } from '../commons/modal.js'
import { TextRender } from './text-render.js'
import { ResizeWatcher } from '../commons/resize-watcher.js'
import { FileSelector } from '../commons/file-selector.js'

export class App {
  constructor (window) {
    this.window_ = window
    try {
      this.storage_ = window.$localStorage || window.localStorage
    } catch {
      this.storage_ = {
        getItem: () => '',
        setItem: () => true
      }
    }
  }

  async launch () {
    this.root_ = document.getElementById('app')
    document.addEventListener('keydown', (ev) => this.handlerKeys_(ev))
    this.logoContainer_ = document.getElementById('logoContainer')
    this.tryOpenFile_ = async () => {
      if (this.isLoadingFile_) {
        return
      }
      this.fileSelector_.selectFile('text/plain', 'Text', async (res) => {
        if (res) {
          await this.loadFile_(res.file, res.data)
        }
      })
    }
    this.keyBindings_ = {
      'C-O': this.tryOpenFile_,
      'C-R': () => window.location.reload(),
      ARROWRIGHT: () => this.pageDown_(),
      ARROWLEFT: () => this.pageUp_()
    }
    new ResizeWatcher(window).register(
      () => this.fileContent_ && this.reload_()
    )
    this.readerContainer_ = document.getElementById('readerContainer')
    this.readerContainer_.onclick = (ev) => this.handleClicks_(ev)
    this.textRender_ = new TextRender(this.readerContainer_)
    this.fileSelector_ = new FileSelector(this.root_)
    this.logoContainer_.addEventListener('click', this.tryOpenFile_)
    this.clickResions_ = [
      '11066666044',
      '11066666044',
      '11000000022',
      '11003330022',
      '11003330022',
      '11003330022',
      '11000000022',
      '22222222255',
      '22222222255'
    ]
    this.themes_ = [
      {
        fontSize: 18,
        color: 'darkslateblue',
        hightcolor: 'red',
        fontFamily: 'serif',
        background: '#f6f6e2'
      },
      {
        fontSize: 18,
        color: '#eee',
        hightcolor: 'red',
        fontFamily: 'serif',
        background: '#333'
      }
    ]
    this.clickResionsHeight_ = this.clickResions_.length
    this.clickResionsWidth_ = this.clickResions_[0].length
    /** @type Map<number,number> */
    this.pages_ = new Map()
    this.modal_ = new Modal()
  }

  handleClicks_ ({ x, y }) {
    const px = Math.floor(
      (x * this.clickResionsWidth_) / this.readerContainer_.clientWidth
    )
    const py = Math.floor(
      (y * this.clickResionsHeight_) / this.readerContainer_.clientHeight
    )
    const type = this.clickResions_[py][px] >>> 0
    switch (type) {
      case 1:
        this.pageUp_()
        break
      case 2:
        this.pageDown_()
        break
      case 3:
        this.tryOpenFile_()
        break
      case 4:
        this.changeFullscreen_()
        break
      case 5:
        this.changeTheme_()
        break
      case 6:
        this.goto_()
        break
    }
  }

  async goto_ () {
    const res = await this.modal_.prompt(
      '转到',
      Math.floor((this.currentOffset_ * 100) / this.fileContent_.length),
      {
        type: 'range',
        max: 100,
        min: 0
      }
    )
    if (!res) {
      return
    }
    this.currentOffset_ = Math.floor(
      (this.fileContent_.length * (res >>> 0)) / 100
    )
    await this.reload_()
  }

  changeFullscreen_ () {
    this.root_.requestFullscreen()
  }

  handlerKeys_ (/** @type KeyboardEvent */ ev) {
    const keyStr = `${ev.ctrlKey ? 'C-' : ''}${ev.shiftKey ? 'S-' : ''}${
      ev.altKey ? 'A-' : ''
    }${ev.key.toUpperCase()}`
    if (this.keyBindings_[keyStr]) {
      ev.stopPropagation()
      ev.preventDefault()
      this.keyBindings_[keyStr]()
    }
  }

  async pageUp_ () {
    await this.loadPage_(this.currentPageIdx_ - 1)
  }

  async pageDown_ () {
    await this.loadPage_(this.currentPageIdx_ + 1)
  }

  async paging_ () {
    if (this.reloadCancleSource_) {
      this.reloadCancleSource_.cancled = true
    }
    const cancleSource = {}
    this.reloadCancleSource_ = cancleSource
    let firstPage = 0
    const onpage = (page, offset, nextOffset) => {
      if (page < firstPage) {
        firstPage = page
      }
      this.pages_.set(page, { offset, nextOffset })
    }
    const start = Date.now()
    await this.textRender_.page(
      this.fileContent_,
      this.zeroPageOffset_,
      onpage,
      {
        fontSize: this.fontSize_
      },
      cancleSource
    )
    if (cancleSource.cancled) {
      return
    }
    if (this.zeroPageOffset_ > 0) {
      const newOffsets = new Map()
      for (const [page, offset] of this.pages_) {
        newOffsets.set(page - firstPage, offset)
      }
      this.currentPageIdx_ -= firstPage
      this.pages_ = newOffsets
      this.zeroPageOffset_ = 0
    }
    console.log(`Page Finished: ${(Date.now() - start) / 1000}s`)
  }

  async loadPage_ (pageIdx) {
    if (pageIdx < 0) {
      return
    }
    if (this.pages_.has(pageIdx)) {
      this.currentPageIdx_ = pageIdx
      const page = this.pages_.get(this.currentPageIdx_)
      this.currentOffset_ = page.offset
      const nextOffset =
        page.offset +
        this.textRender_.rend(this.fileContent_, page.offset, page.nextOffset)
      this.storage_.setItem(`${this.fileName_}_offset`, this.currentOffset_)
      if (
        this.pages_.has(this.currentPageIdx_ + 1) &&
        this.pages_.get(this.currentPageIdx_ + 1).offset !== nextOffset &&
        nextOffset != this.fileContent_.length
      ) {
        this.paging_()
        console.log(page, nextOffset)
      }
    }
  }

  async changeTheme_ () {
    let idx = this.themes_.findIndex((t) => t === this.currentTheme_)
    idx = (idx + 1) % this.themes_.length
    this.currentTheme_ = this.themes_[idx]
    this.fileContent_ && (await this.reload_())
    this.root_.style.background = this.currentTheme_.background
  }

  async reload_ () {
    this.pages_ = new Map()
    this.zeroPageOffset_ = this.currentOffset_
    this.pages_.set(0, { offset: this.currentOffset_ })
    this.textRender_.setStyle(this.currentTheme_)
    this.paging_()
    await this.loadPage_(0)
  }

  async loadFile_ (/** @type File */ file, content) {
    if (!this.themeInited_) {
      this.changeTheme_()
      this.themeInited_ = true
    }
    this.isLoadingFile_ = true
    this.logoContainer_.classList.add('hidden')
    this.readerContainer_.classList.remove('hidden')
    this.fileName_ = file.name
    this.fileContent_ = content || (await readFile(file))
    const offset = await this.storage_.getItem(`${this.fileName_}_offset`)
    this.currentOffset_ = Math.min(
      parseInt(offset) || 0,
      this.fileContent_.length
    )
    await this.reload_()
    this.isLoadingFile_ = false
  }
}
