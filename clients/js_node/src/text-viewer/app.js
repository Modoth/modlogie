import { FileSelector } from '../commons/file-selector.js'
import { WebFile } from '../commons/ifile.js'
import TextReader from './text-reader.js'
import TextRenderManager from './text-render-manager.js'

export class App {
  constructor (window) {
    this.window_ = window
    this.clickResions = [
      '112',
      '102',
      '122'
    ]
    this.clickResionsHeight = this.clickResions.length
    this.clickResionsWidth = this.clickResions[0].length
    this.tryOpenFile = async () => {
      if (this.isLoadingFile || window.$file) {
        return
      }
      this.fileSelector.selectFile('text/plain', 'Text', async (res) => {
        if (res) {
          await this.loadFile(new WebFile(res.file))
        }
      })
    }
  }

  handleClicks (ev) {
    const { offsetX: x, offsetY: y } = ev
    const px = Math.floor((x * this.clickResionsWidth) / this.container.clientWidth)
    const py = Math.floor((y * this.clickResionsHeight) / this.container.clientHeight)
    switch (parseInt(this.clickResions[py][px])) {
      case 1:
        this.manager && this.manager.pageUp()
        break
      case 2:
        this.manager && this.manager.pageDown()
        break
      case 3:
        this.tryOpenFile()
        break
      case 4:
        break
      case 5:
        break
      case 6:
        break
    }
  }

  async loadFile (file) {
    if (this.manager) {
      this.manager.dispose()
      this.manager = null
    }
    this.manager = new TextRenderManager('', new TextReader(file))
    this.manager.connect(this.container)
  }

  async launch () {
    this.fileSelector = new FileSelector(document.body)
    this.container = document.getElementById('app')
    this.container.onclick = this.handleClicks.bind(this)

    if (window.$file) {
      this.loadFile(window.$file)
    }
  }
}
