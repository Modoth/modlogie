import TextRenderManager from './text-render-manager.js'
import TextReader from './text-reader.js'

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
    this.container = document.getElementById('app')
    const manager = new TextRenderManager('', new TextReader(window.$file))
    manager.connect(this.container)
  }
}
