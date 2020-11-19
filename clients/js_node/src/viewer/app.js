import { FileSelector } from '../commons/file-selector.js'
import { ResizeWatcher } from '../commons/resize-watcher.js'
import { WebFile, BufferFile } from '../commons/ifile.js'

export class App {
  constructor () {
    try {
      this.storage = window.$localStorage || window.localStorage
    } catch {
      this.storage = {
        getItem: () => '',
        setItem: () => true
      }
    }
    this.resizeWatcher = new ResizeWatcher()
    const viewer = this.tryGetView()
    if (!viewer) {
      return
    }
    const { clickRegions, clickCommands, accept, name, manager } = viewer.init(
      {
        storage: this.storage,
        resizeWatcher: this.resizeWatcher,
        selectFile: () => this.selectFile(),
        showHelp: () => this.showHelp(),
        toogleFullscreen: window.$fullscreen && window.$fullscreen.toogle ? () => window.$fullscreen.toogle() : () => {}
      })
    this.manager = manager
    this.clickRegions = clickRegions || []
    this.accept = accept || '*'
    this.clickCommands = new Map((clickCommands || []).map(i => [i.sym, i]))
    this.clickResionsHeight = this.clickRegions.length
    this.clickResionsWidth = this.clickRegions[0].length
    this.fileSelector = new FileSelector(document.body)
    this.container = document.getElementById('readerContainer')
    this.logoContainer = document.getElementById('logoContainer')
    this.logoContainer.onclick = () => this.selectFile()
    this.logo = document.getElementById('logo')
    this.help = document.getElementById('help')
    this.help.onclick = (e) => {
      this.showHelp()
      e.stopPropagation()
    }
    this.helpContent = document.getElementById('helpContent')
    this.helpContent.onclick = () => {
      this.helpContent.classList.add('hidden')
    }
    for (const row of this.clickRegions) {
      const r = document.createElement('div')
      this.helpContent.appendChild(r)
      for (const sym of row) {
        const c = document.createElement('div')
        r.appendChild(c)
        const cmd = this.clickCommands.get(sym)
        if (!cmd || !cmd.name) {
          continue
        }
        c.innerText = cmd.name
      }
    }
    this.logo.innerText = name || accept
    if (this.clickResionsWidth && this.clickResionsHeight) {
      this.container.onclick = this.onClicked.bind(this)
    }
  }

  tryGetView () {
    try {
      // eslint-disable-next-line no-undef
      return new Viewer()
    } catch {
      console.log('Invalid viewer.')
    }
  }

  showHelp () {
    this.helpContent.classList.remove('hidden')
  }

  async selectFile () {
    if (this.isLoadingFile || window.$file) {
      return
    }
    this.fileSelector.selectFile(this.accept, null, async (res) => {
      if (res) {
        if (res.data) {
          await this.loadFile(new BufferFile(res.file.name, res.data))
        } else {
          await this.loadFile(new WebFile(res.file))
        }
      }
    })
  }

  onClicked (ev) {
    const { offsetX: x, offsetY: y } = ev
    const px = Math.floor((x * this.clickResionsWidth) / this.container.clientWidth)
    const py = Math.floor((y * this.clickResionsHeight) / this.container.clientHeight)
    const cmdSym = this.clickRegions[py][px]
    const cmd = this.clickCommands.get(cmdSym)
    if (cmd && cmd.exec) {
      cmd.exec()
    }
  }

  async loadFile (file) {
    if (!this.manager) {
      return
    }
    this.logoContainer.classList.add('hidden')
    this.container.classList.remove('hidden')
    await this.manager.loadTo(file, this.container)
  }

  async launch () {
    if (window.$file) {
      this.loadFile(window.$file)
    }
  }
}
