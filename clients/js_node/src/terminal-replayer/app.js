import { TerminalReplayer } from './terminal-replayer.js'
import { highlight } from './highlight.js'

class App {
  initComponents () {
    const style = /** @imports css */ './app.css'
    this.replay_ = document.createElement('div')
    this.replay_.classList.add('replay')
    this.replay_.innerText = 'REPLAY'
    this.replayer_ = new TerminalReplayer()
    this.replayer_.view.classList.add('terminal-replayer')
    this.root.appendChild(this.replayer_.view)
    this.root.appendChild(this.replay_)
    this.root.appendChild(style)
    this.replay_.onclick = () => {
      if (this.cancleToken_) {
        this.pause()
      } else {
        this.resume()
      }
    }
    this.testData_ = /** @imports txt */ './app-data.txt'
  }

  async start (data) {
    this.highlightedData_ = [highlight(data || this.testData_)]
    const option = { inputCharDelay: 0, outputCharDelay: 0 }
    await this.resume(option)
  }

  async pause () {
    if (this.cancleToken_) {
      this.cancleToken_.cancled = true
    }
  }

  async resume (option) {
    if (this.cancleToken_) {
      return
    }
    this.cancleToken_ = { cancled: false }
    this.replay_.classList.add('playing')
    this.replay_.innerText = 'STOP'
    await this.replayer_.replay(
      this.highlightedData_,
      option,
      this.cancleToken_
    )
    this.replay_.classList.remove('playing')
    this.replay_.innerText = 'PLAY'
    this.cancleToken_ = null
  }
}
