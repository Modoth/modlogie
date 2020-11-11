'use strict'

import { ResizeWatcher } from '../commons/resize-watcher.js'

class App {
  constructor () { }
  initComponents () {
    ;['cellsTable'].forEach((n) => {
      this[n] = document.getElementById(n)
    })
    this.start()
    new ResizeWatcher(window).register(this.tryResize.bind(this))
  }

  updateMines (success) {
    this.cells.forEach((cs) =>
      cs.forEach((c) => {
        if (c.isMine) {
          c.btn.value = success ? '⚑' : '☣'
          c.btn.classList.add(success ? 'success' : 'fail')
        }
      })
    )
  }

  select (cell) {
    if (!this.isRunning) {
      this.start()
      return
    }
    this.hasFliped = true
    if (cell.isFliped) {
      return
    }
    if (cell.isMine) {
      this.isRunning = false
      this.updateMines(false)
      return
    }

    this.flipCell(cell)
    if (this.remainCells <= this.mineCount) {
      this.isRunning = false
      this.hasFliped = false
      this.updateMines(true)
    }
  }

  flipCell (cell) {
    if (cell.isFliped) {
      return
    }
    this.remainCells--
    cell.isFliped = true
    cell.btn.classList.add('flipped')
    const { i, j } = cell
    let mineCount = 0
    const nCells = []
    const iMin = Math.max(0, i - 1)
    const iMax = Math.min(this.width, i + 2)
    const jMin = Math.max(0, j - 1)
    const jMax = Math.min(this.height, j + 2)
    for (let s = jMin; s < jMax; s++) {
      for (let r = iMin; r < iMax; r++) {
        if (r === i && s === j) {
          continue
        }
        const nCell = this.cells[s][r]
        if (nCell.isMine) {
          mineCount++
        } else {
          nCells.push(nCell)
        }
      }
    }
    if (mineCount == 0) {
      for (const c of nCells) {
        this.flipCell(c)
      }
    } else {
      cell.btn.value = mineCount
    }
  }

  calculateSize () {
    const cellWidth = 36
    this.width = Math.floor(window.innerWidth / cellWidth)
    this.height = Math.floor(window.innerHeight / cellWidth)
    if (this.width < this.height) {
      this.height = Math.min(this.width / 0.618, this.height)
    } else {
      this.width = Math.min(this.height / 0.618, this.width)
    }
    this.cellsTable.style.width = `${this.width * cellWidth}px`
    this.cellsTable.style.height = `${this.height * cellWidth}px`
  }

  tryResize () {
    if (this.hasFliped) {
      return
    }
    this.start()
  }

  start () {
    this.calculateSize()
    this.isRunning = true
    this.cellsTable.innerHTML = ''
    this.cellsCount = this.width * this.height
    this.remainCells = this.cellsCount
    const mineOp = 0.2
    this.cells = []
    this.mineCount = 0
    for (let j = 0; j < this.height; j++) {
      const raw = []
      this.cells.push(raw)
      const cellsRow = document.createElement('div')
      cellsRow.classList.add('cellsRow')
      this.cellsTable.appendChild(cellsRow)
      for (let i = 0; i < this.width; i++) {
        const cell = {
          i,
          j
        }
        raw.push(cell)
        if (Math.random() < mineOp) {
          cell.isMine = true
          this.mineCount++
        }
        const btn = document.createElement('input')
        btn.type = 'button'
        btn.dataset.char = Math.floor(Math.random() * 9)
        if (cell.isMine) {
          btn.classList.add('mine')
        }
        btn.onclick = () => this.select(cell)
        cell.btn = btn
        cellsRow.appendChild(btn)
      }
    }
  }
}

window.onload = () => {
  new App().initComponents()
}
