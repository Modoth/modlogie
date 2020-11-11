import { sleep } from '../commons/sleep.js'

export class DistinctClozeGenerator {
  constructor (
    /** @type string[] */ dataSource,
    { perGen = 10, genTimes = 1000, rCloze = 0.6 } = {}
  ) {
    /** @private */
    this.dataSource_ = dataSource
    this.perGen_ = perGen
    this.genTimes_ = genTimes
    this.rCloze_ = rCloze
    this.analysis_(dataSource)
  }

  /** @private */
  async analysis_ (dataSource) {
    this.rank_ = 0
    this.count_ = 0
    const maxRank = 8
    for (let r = 0; r < maxRank; r++) {
      const count = r * r
      if (count > this.dataSource_.length) {
        break
      }
      this.rank_ = r
      this.count_ = count
    }
    this.dataSource_ = this.dataSource_.slice(0, this.count_)
    const length = this.count_
    const cellCount = length * length
    if (length < 9) {
      this.notRandomArranges_ = this.generateArranges_(
        Array.from({ length: cellCount }, () => -1),
        this.rank_,
        this.count_,
        this.genTimes_ * this.perGen_
      )
    } else {
      this.notRandomArranges_ = []
      for (let i = 0; i < this.genTimes_; i++) {
        const initRange = Array.from({ length: cellCount }, () =>
          Math.floor(Math.random() * length)
        )
        this.notRandomArranges_.push(
          ...this.generateArranges_(
            initRange,
            this.rank_,
            this.count_,
            this.perGen_
          )
        )
        if (this.notRandomArranges_.length > 0) {
          await sleep(0)
        }
      }
    }
  }

  cloneArrange_ (/** @type [[]] */ origin, length) {
    return Array.from({ length }, (_, j) =>
      Array.from({ length }, (_, i) => origin[i + j * length])
    )
  }

  generateArranges_ (initRange, rank, length, generateCount) {
    const arranges = []
    const rowsBitmaps = Array.from({ length }, () => new Set())
    const columnsBitmaps = Array.from({ length }, () => new Set())
    const tilesBitmaps = Array.from({ length }, () => new Set())
    const getBitmaps = (idx) => {
      const i = idx % length
      const j = (idx - i) / length
      const rowbitmap = rowsBitmaps[j]
      const columnbitmap = columnsBitmaps[i]
      const tilebitmap =
        tilesBitmaps[Math.floor(i / rank) + Math.floor(j / rank) * rank]
      return [rowbitmap, columnbitmap, tilebitmap]
    }
    const cellCount = length * length
    const arrange = initRange
    let idx
    for (idx = 0; idx < cellCount && idx >= 0; idx++) {
      for (let r = idx + 1; r < cellCount; r++) {
        const v = arrange[r]
        if (v === -1) {
          break
        }
        getBitmaps(r).forEach((b) => b.delete(v))
        arrange[r] = -1
      }
      const bitmaps = getBitmaps(idx)
      bitmaps.forEach((b) => b.delete(arrange[idx]))
      let insertSuccess = false
      for (let v = arrange[idx] + 1; v < length; v++) {
        if (bitmaps.some((b) => b.has(v))) {
          continue
        }
        arrange[idx] = v
        insertSuccess = true
        if (idx === cellCount - 1) {
          generateCount--
          arranges.push([...arrange])
          if (generateCount <= 0) {
            return arranges
          }
        } else {
          bitmaps.forEach((b) => b.add(v))
        }
        break
      }
      if (!insertSuccess || idx === cellCount - 1) {
        idx -= 2
      }
    }
    return arranges
  }

  generate () {
    const source = this.dataSource_
    const length = this.count_
    let remain = 0
    const rand = this.notRandomArranges_[
      Math.floor(Math.random() * this.notRandomArranges_.length)
    ]
    const matric = Array.from({ length }, (_, j) =>
      Array.from({ length }, (_, i) => {
        const cell =
          Math.random() >= this.rCloze_
            ? {
                class: ClozeCellClass.PreInsert,
                content: source[rand[i + j * length]]
              }
            : { class: ClozeCellClass.UserInsert }

        if (
          cell &&
          cell.class === ClozeCellClass.UserInsert &&
          cell.content === undefined
        ) {
          remain++
        }
        cell.group =
          Math.floor(i / this.rank_) + Math.floor(j / this.rank_) * this.rank_
        return cell
      })
    )
    return new Cloze(
      matric,
      length,
      length,
      remain,
      this.check_.bind(this),
      this.getOptions_.bind(this),
      this.rank_
    )
  }

  loopNeighber_ (x, y, cloze, interrupt) {
    for (let j = 0; j < cloze.height; j++) {
      if (j === y) {
        continue
      }
      if (interrupt(x, j)) {
        return false
      }
    }
    for (let i = 0; i < cloze.width; i++) {
      if (i === x) {
        continue
      }
      if (interrupt(i, y)) {
        return false
      }
    }
    const rank = Math.sqrt(cloze.width)
    const startX = Math.floor(x / rank) * rank
    const startY = Math.floor(y / rank) * rank
    for (let j = 0; j < rank; j++) {
      for (let i = 0; i < rank; i++) {
        if (startX + i == x && startY + j === y) {
          continue
        }
        if (interrupt(startX + i, startY + j)) {
          return false
        }
      }
    }
    return true
  }

  check_ (x, y, value, cloze) {
    if (value === undefined) {
      return true
    }
    return this.loopNeighber_(
      x,
      y,
      cloze,
      (m, n) => cloze.get(m, n).content === value
    )
  }

  getOptions_ (x, y, cloze) {
    const options = new Set(Array.from(this.dataSource_))
    this.loopNeighber_(
      x,
      y,
      cloze,
      (m, n) => options.delete(cloze.get(m, n).content) && false
    )
    return [undefined, ...options]
  }
}
