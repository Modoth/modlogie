import { ResizeWatcher } from '../commons/resize-watcher.js'
import { Cloze, ClozeCellClass } from './cloze.js'
import { WordsClozeGenerator } from './words-cloze-generator.js'
import { DistinctClozeGenerator } from './distinct-cloze-generator.js'

class App {
  view () {
    const components = ['board', 'select-board', 'select-board-panel']
    return [
      components,
      ...'./cloze.html',
      /** @imports css */ './app.css'
    ]
  }

  validateData (data) {
    data = data || /** @imports json */ './app-data.json'
    if (typeof data === 'string') {
      return {
        type: 'words',
        source: data
          .split('\n')
          .map((i) => i.trim())
          .filter((i) => i)
      }
    }
    data.type = data.type || 'words'
    return data
  }

  async start () {
    new ResizeWatcher(window).register(() => {
      this.startCloze_(true)
    })
    this.fontSizes_ = Array.from({ length: 20 }, (_, i) => 8 + i * 2)
    this.cellSizes_ = Array.from({ length: 12 }, (_, i) => 78 - i * 6)
    this.recommendSize = 50
    this.margin_ = 10
    this.menu_ = [
      // {
      //   name: '↺',
      //   onclick: () => {},
      // },
      {
        name: '↺',
        onclick: () => this.startCloze_()
      }
    ]
    const generatorClasses = {
      words: WordsClozeGenerator,
      distinct: DistinctClozeGenerator
    }
    const { type, source, options } = this.data
    if (generatorClasses[type]) {
      this.generator_ = new generatorClasses[type](source, options)
      while (this.generator_) {
        await this.startCloze_()
      }
    }
  }

  fitWidth_ () {
    let width, height, cellSize
    for (cellSize of this.cellSizes_) {
      width = Math.floor((window.innerWidth - this.margin_) / cellSize)
      height = Math.floor((window.innerHeight - this.margin_) / cellSize)
      if (width * height > this.recommendSize) {
        break
      }
    }
    return [width, height, cellSize]
  }

  fitSize_ (width, height) {
    let cellSize
    for (cellSize of this.cellSizes_) {
      const remainX = Math.floor(
        window.innerWidth - this.margin_ - cellSize * width
      )
      const remainY = Math.floor(
        window.innerHeight - this.margin_ - cellSize * height
      )
      if (remainX > 0 && remainY > 0) {
        break
      }
    }
    return cellSize
  }

  /** @private */
  async startCloze_ (resizeOnly = false) {
    if (resizeOnly) {
      if (this.cloze_) {
        this.calculateSizeAndUpdate()
      }
      return
    }
    if (this.currentClozeTask_) {
      this.currentClozeTask_()
    }
    const [width, height, cellSize] = this.fitWidth_()
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      this.currentClozeTask_ = resolve
      this.cloze_ = this.generator_.generate(width, height)
      this.calculateSizeAndUpdate()
    })
  }

  calculateSizeAndUpdate () {
    const cellSize = this.fitSize_(this.cloze_.width, this.cloze_.height)
    this.components.selectBoardPanel.classList.add('hidden')
    this.components.root.onclick = () => {
      this.components.selectBoardPanel.classList.add('hidden')
      this.checkFinish_(this.cloze_)
    }
    this.updateBoardCells_(this.cloze_, cellSize)
  }

  checkFinish_ (cloze) {
    const remain = cloze.remain
    if (remain <= 0) {
      this.startCloze_()
    }
  }

  /** @private */
  selectCell (/** @type Cloze */ cloze, i, j, cell, cellContent) {
    const options = cloze.getOptions(i, j)
    if (this.currentCell_) {
      this.currentCell_.classList.remove('selected')
    }
    this.currentCell_ = cell
    this.currentCell_.classList.add('selected')
    this.updateSelectBoardCells_(options, (opt) => {
      if (cloze.set(i, j, opt)) {
        cellContent.innerText = opt === undefined ? '' : opt
        this.checkFinish_(cloze)
        return true
      }
    })
  }

  updateSelectBoardCells_ (options, select) {
    this.components.selectBoard.innerHTML = ''
    for (const o of options) {
      const [cell, cellContent] = this.createCell_()
      cell.classList.add('user-insert')
      cellContent.innerText = o === undefined ? '' : o
      cell.onclick = (ev) => {
        ev.stopPropagation()
        this.components.selectBoardPanel.classList.add('hidden')
        select(o)
      }
      this.components.selectBoard.appendChild(cell)
    }
    for (const item of this.menu_) {
      const [cell, cellContent] = this.createCell_()
      cell.classList.add('pre-insert')
      cellContent.innerText = item.name
      cell.onclick = (ev) => {
        ev.stopPropagation()
        this.components.selectBoardPanel.classList.add('hidden')
        item.onclick()
      }
      this.components.selectBoard.appendChild(cell)
    }

    this.components.selectBoardPanel.classList.remove('hidden')
  }

  createCell_ () {
    const cell = document.createElement('div')
    cell.classList.add('cell')
    const cellBorder = document.createElement('div')
    cellBorder.classList.add('cell-border')
    cell.appendChild(cellBorder)
    const cellContent = document.createElement('div')
    cellContent.classList.add('cell-content')
    cellBorder.appendChild(cellContent)
    return [cell, cellContent]
  }

  /** @private */
  updateBoardCells_ (/** @type Cloze */ cloze, cellSize) {
    this.components.board.innerHTML = ''
    const cellStyle = document.createElement('style')
    const fontSize = this.fontSizes_.find((f) => f > cellSize / 2)
    cellStyle.innerHTML = `
    .cell{
      width: ${cellSize}px;
      height: ${cellSize}px;
      font-size: ${fontSize}px;
    }
    `
    const styleGroupCount = cloze.group % 2 ? 2 : 3
    this.components.board.appendChild(cellStyle)
    for (let j = 0; j < cloze.height; j++) {
      const row = document.createElement('div')
      row.classList.add('row')
      for (let i = 0; i < cloze.width; i++) {
        const [cell, cellContent] = this.createCell_()
        const cellData = cloze.get(i, j)
        if (!cellData) {
          cell.classList.add(ClozeCellClass.Blank)
        } else {
          cell.classList.add(cellData.class)
          cellContent.innerText = cellData.content || ''
          if (cellData.class === ClozeCellClass.UserInsert) {
            cell.onclick = (ev) => {
              ev.stopPropagation()
              this.selectCell(cloze, i, j, cell, cellContent)
            }
          }
          if (cellData.group !== undefined) {
            cell.classList.add(`cell-group-${cellData.group % styleGroupCount}`)
          }
        }
        row.appendChild(cell)
      }
      this.components.board.appendChild(row)
    }
  }
}
