export class AppBase {
  async init(/**@type HTMLElement */ root, data) {
    this.storage = this.initStorage_()
    this.root = root
    this.data = await this.validateData(data)
    await this.initComponents(this.root)
    this.components = { root }
    const componentNames = []
    const append = (item) => {
      if (item instanceof Array) {
        for (const element of item) {
          append(element)
        }
      } else if (item instanceof HTMLElement) {
        this.root.appendChild(item)
      } else if (typeof item === 'string') {
        componentNames.push(item)
      } else {
        console.log(item)
      }
    }
    let view = this.view(this.root)
    append(view)
    componentNames.forEach(
      (item) =>
        (this.components[this.getElementName(item)] = document.getElementById(
          item
        ))
    )
    await this.start(this.data)
  }

  initStorage_() {
    if (window.$storage) {
      return window.$storage
    }
    try {
      const s = window.localStorage
      return s
    } catch {
      return {
        getItem: () => '',
        setItem: () => true,
      }
    }
  }

  getElementName(id) {
    return id.replace(/-(.)/g, (_, g) => g.toUpperCase())
  }

  async validateData(data) {
    return data
  }

  async initComponents() {}

  view() {}

  async start() {
    console.log('start')
  }

  async pause() {
    console.log('pause')
  }

  async resume() {
    console.log('pause')
  }

  async stop() {
    console.log('stop')
  }
}
