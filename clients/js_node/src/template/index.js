import { AppBase } from './app-base.js'

window.onload = async () => {
  let app = new AppBase()
  if (App) {
    const base = app
    app = new App()
    let current = app
    while (current.__proto__ && current.__proto__ != Object.prototype) {
      current = current.__proto__
    }
    current.__proto__ = base
  }
  window.app = app
  await app.init(window.document.getElementById('app'), window.appData)
}
