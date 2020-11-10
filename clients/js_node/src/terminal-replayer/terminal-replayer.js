import { sleep } from '../commons/sleep.js'

class Context {
  constructor() {
    this.currentLine = ''
    this.lines = [this.currentLine]
    this.styles = new Set()
    this.enableCaret = false
    this.caretY = 0
    this.caretX = 0
  }
}

export class TerminalReplayer {
  constructor() {
    this.root_ = document.createElement('div')
    const shadow = this.root_.attachShadow({ mode: 'closed' })
    const style = /**@imports css */ './terminal-replayer.css'
    shadow.appendChild(style)
    this.screen_ = document.createElement('pre')
    this.screen_.classList.add('screen')
    shadow.appendChild(this.screen_)
    this.escapePrefix_ = '\u{1b}'
    this.csiSurfix_ = 'm'
  }

  get view() {
    return this.root_
  }

  printCaret_() {
    const e = document.createElement('code')
    e.innerText = '|'
    e.classList.add('caret')
    e.classList.add('hidden')
    this.screen_.appendChild(e)
    this.caret_ = e
  }

  clearScreen_(/**@type Context */ ctx, type) {
    switch (type) {
      case 1:
        return
      case 2:
        ctx.caretX = 0
        ctx.caretY = 0
        this.screen_.innerHTML = ''
        this.screen_.appendChild(this.caret_)
        this.rows_ = [[]]
        return
      default:
        let currentRow = this.rows_[ctx.caretY]
        for (let i = ctx.caretX; i < currentRow.length; i++) {
          this.screen_.removeChild(currentRow[i])
        }
        this.rows_[ctx.caretY] = currentRow.slice(0, ctx.caretX)
        for (let j = ctx.caretY + 1; j < this.rows_.length; j++) {
          currentRow = this.rows_[j]
          for (let i = 0; i < currentRow.length; i++) {
            this.screen_.removeChild(currentRow[i])
          }
        }
        this.rows_ = this.rows_.slice(0, ctx.caretY + 1)
        return
    }
  }

  changeCaretPosition_(/**@type Context */ ctx, dx = 0, dy = 0) {
    let nextY = ctx.caretY + (dy || 0)
    let nextX = ctx.caretX + (dx || 0)
    nextY = Math.min(this.rows_.length - 1, nextY)
    nextY = Math.max(0, nextY)
    const row = this.rows_[nextY]
    nextX = Math.min(row.length, nextX)
    nextX = Math.max(0, nextX)
    this.screen_.removeChild(this.caret_)
    const nextChar = row[nextX]
    if (nextChar) {
      this.screen_.insertBefore(this.caret_, nextChar)
    } else {
      this.screen_.appendChild(this.caret_)
    }
    ctx.caretX = nextX
    ctx.caretY = nextY
  }

  changeCaretState_(/**@type Context */ ctx, enable = false) {
    ctx.enableCaret = enable
    if (enable) {
      this.caret_.classList.remove('hidden')
    } else {
      this.caret_.classList.add('hidden')
    }
  }

  resetAll_(ctx) {
    this.resetCsi_(ctx)
  }

  async escape_(/**@type Context */ ctx) {
    const type = ctx.currentLine[0]
    switch (type) {
      case 'N':
      case 'O':
      case 'P':
      case '\\':
      case ']':
      case 'X':
      case '^':
      case '_':
      case 'N':
        ctx.currentLine = ctx.currentLine.slice(1)
        return
      case 'c':
        ctx.currentLine = ctx.currentLine.slice(1)
        await this.resetAll_(ctx)
        return
      case '[':
        ctx.currentLine = ctx.currentLine.slice(1)
        await this.csi_(ctx)
        return
      default:
        return
    }
  }

  resetCsi_(/**@type Context */ ctx) {
    ctx.styles.clear()
  }

  csiClear_(/**@type Context */ ctx, /**@type string */ group) {
    ctx.styles.delete(group)
  }

  csiSet_(/**@type Context */ ctx, csiCmd, /**@type string */ group) {
    ctx.styles.add(group)
    ctx[group] = `csi-${csiCmd}`
  }

  csiSgr_(/**@type Context */ ctx, sgrType) {
    switch (sgrType) {
      case 0:
        this.resetCsi_(ctx)
        return
      case 1:
      case 2:
        this.csiSet_(ctx, sgrType, 'font-weight')
        return
      case 3:
        this.csiSet_(ctx, sgrType, 'font-style')
        return
      case 5:
      case 6:
        this.changeCaretState_(ctx, true)
        return
      case 25:
        this.changeCaretState_(ctx, false)
        return
      case 30:
      case 31:
      case 32:
      case 33:
      case 34:
      case 35:
      case 36:
      case 37:
        this.csiSet_(ctx, sgrType, 'color')
        return
      case 40:
      case 41:
      case 42:
      case 43:
      case 44:
      case 45:
      case 46:
      case 47:
        this.csiSet_(ctx, sgrType, 'background')
        return
      default:
        return
    }
  }

  async csi_(/**@type Context */ ctx) {
    const match = ctx.currentLine.match(/^([\d;]*)([ABCDEFGHJKSTZfminsu])/)
    if (!match) {
      return
    }
    const csiType = match[2]
    const args = match[1].split(';').map((arg) => parseInt(arg))
    const arg = args[args.length - 1]
    ctx.currentLine = ctx.currentLine.slice(match[0].length)
    switch (csiType) {
      case 'm':
        this.csiSgr_(ctx, arg || 0)
        return
      case 'C':
        if (arg > 0) {
          this.changeCaretPosition_(ctx, -arg)
        }
        return
      case 'Z':
        if (arg > 0) {
          await sleep(arg)
        }
        return
      case 'J':
        this.clearScreen_(ctx, arg || 0)
        return
      default:
        return
    }
  }

  printChar_(/**@type Context */ ctx, c) {
    const e = document.createElement('code')
    e.innerText = c
    for (const style of ctx.styles) {
      ctx[style] && e.classList.add(ctx[style])
    }
    this.screen_.insertBefore(e, this.caret_)
    this.rows_[ctx.caretY] = [
      ...this.rows_[ctx.caretY].slice(0, ctx.caretX),
      e,
      ...this.rows_[ctx.caretY].slice(ctx.caretX),
    ]
    if (c === '\n') {
      ctx.caretY++
      ctx.caretX = 0
      this.rows_[ctx.caretY] = []
    } else {
      ctx.caretX++
    }
    this.screen_.scrollTo({
      top: this.screen_.scrollHeight - this.screen_.clientHeight,
    })
  }

  async printLine_(/**@type Context */ ctx) {
    while (ctx.currentLine.length) {
      if (ctx.currentLine.startsWith(this.escapePrefix_)) {
        ctx.currentLine = ctx.currentLine.slice(this.escapePrefix_.length)
        await this.escape_(ctx)
        continue
      }
      let c = ctx.currentLine[0]
      ctx.currentLine = ctx.currentLine.slice(1)
      if (c === '\u{d}' && ctx.currentLine[0] === '\n') {
        c = ctx.currentLine[0]
        ctx.currentLine = ctx.currentLine.slice(1)
      }
      this.printChar_(ctx, c)
      if (!ctx.currentLine.length) {
        return
      }
      if (this.cancleToken_.cancled) {
        continue
      }
      if (ctx.enableCaret) {
        this.inputCharDelay_ && (await sleep(this.inputCharDelay_))
      } else {
        this.outputCharDelay_ && (await sleep(this.outputCharDelay_))
      }
    }
  }

  async replay(data, option, /**@type { {cancled : boolean} } */ cancleToken) {
    const { inputCharDelay = 75, outputCharDelay = 0 } = option || {}
    this.inputCharDelay_ = inputCharDelay
    this.outputCharDelay_ = outputCharDelay
    this.cancleToken_ = cancleToken
    const ctx = new Context()
    ctx.lines = data
    this.screen_.innerHTML = ''
    this.printCaret_()
    this.rows_ = [[]]
    for (const line of ctx.lines) {
      ctx.currentLine = line
      if (line.delay) {
        this.cancleToken_.cancled || (await sleep(line.delay))
        continue
      }
      await this.printLine_(ctx)
    }
  }
}
