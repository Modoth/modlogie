import { App } from './app.js'

window.onload = async () => {
  const app = new App(window)
  window.app = app
  await app.launch()
}
