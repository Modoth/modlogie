class NumberGenerator {
  constructor (/** @type string */ str) {
    this[Symbol.iterator] = () => new NumberIterator(this)
    str = str && str.trim()
    this.step = 0
    this.length = 0
    /** @type { [number] } */
    this.values_ = []
    if (!str) {
      return
    }
    if (typeof str === 'number') {
      this.length = 1
      this.values_ = [str]
      return
    }
    if (typeof str === 'string') {
      const match = str.match(/\[(.*)\](\*(\d+))?$/)
      let scale = 1
      let infinate = false
      if (match) {
        str = match[1].trim()
        if (match[3]) {
          scale = parseInt(match[3])
        }
      }
      const nums = []
      if (str.endsWith('...')) {
        infinate = true
      }
      const rangeTokens = str
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t)
      for (const rangeToken of rangeTokens) {
        const numTokens = rangeToken
          .split('...')
          .map((t) => t.trim())
          .filter((t) => t)
          .map((t) => parseInt(t))
        switch (numTokens.length) {
          case 1:
            nums.push(numTokens[0])
          case 2:
            let start, end
            if (numTokens[0] > numTokens[1]) {
              start = numTokens[1]
              end = numTokens[0]
              this.step = -scale
            } else {
              start = numTokens[0]
              end = numTokens[1]
              this.step = scale
            }
            if (start > -Infinity && end < Infinity) {
              nums.push(
                ...Array.from({ length: end - start + 1 }, (_, i) => i + start)
              )
            }
        }
      }
      this.values_ = nums.map((n) => n * scale)
      this.length = infinate ? Infinity : this.values_.length
      return
    }
    this.length = str.length
    this.values_ = str
  }

  toFiniteArray () {
    return [...this.values_]
  }

  get (idx = 0) {
    if (idx < 0 || idx >= this.length) {
      return
    }
    const beyondRight = idx + 1 - this.values_.length
    if (beyondRight < 0) {
      return this.values_[idx]
    }
    return this.values_[this.values_.length - 1] + this.step * beyondRight
  }
}

class NumberIterator {
  constructor (/** @type { NumberGenerator } */ generator) {
    this.generator_ = generator
    this.idx = 0
  }

  get current () {
    return this.generator_.get(this.idx)
  }

  next () {
    this.idx++
    if (this.idx < this.generator_.length) {
      return { done: false, value: this.current }
    } else {
      return { done: true }
    }
  }

  goforward () {
    return this.tryGo_(this.idx + 1)
  }

  goback () {
    return this.tryGo_(this.idx - 1)
  }

  tryGo_ (idx) {
    if (idx >= 0 && idx < this.generator_.length) {
      this.idx = idx
      return true
    }
    return false
  }
}

class RandomNameGenerator {
  constructor (ranges = [[0x4e00, 0x9fa5]]) {
    this.ranges = ranges
      .map(([start, end]) => ({
        start: start,
        end: end + 1,
        length: end + 1 - start
      }))
      .sort((r) => r.start)
    this.totalLength_ = this.ranges.reduce((sum, range) => {
      const { length } = range
      range.startIdx = sum
      return sum + length
    }, 0)
  }

  getCodePoint (idx = 0) {
    for (let i = this.ranges.length - 1; i >= 0; i--) {
      const range = this.ranges[i]
      if (range.startIdx < idx) {
        return idx - range.startIdx + range.start
      }
    }
  }

  generate (length = 2) {
    return String.fromCharCode(
      ...Array.from({ length }, () =>
        this.getCodePoint(Math.floor(Math.random() * this.totalLength_))
      )
    )
  }
}

class Ordinal {
  static getOrdinal (name = '') {
    return Ordinal.instances.has(name)
      ? Ordinal.instances.get(name)
      : Ordinal.defaultInstance
  }

  static setOridinal (desc) {
    const oridinal = new Ordinal(desc.name, desc.values)
    Ordinal.instances.set(desc.name, oridinal)
  }

  constructor (name = '', values = []) {
    this.name = name
    this.values_ = values
  }

  getValue (idx = 0) {
    return idx >= 0 && idx < this.values_.length ? this.values_[idx] : idx
  }
}

/** @type { Map<string, Ordinal } */
Ordinal.instances = new Map()
Ordinal.defaultInstance = new Ordinal()

class IncrementsRestraint {
  /** @returns { IncrementsRestraint } */
  static parse (desc) {
    if (!desc) {
      return null
    }
    let autoUpdateScore
    switch (desc.name) {
      case 'sum':
        const sum = parseInt(desc.value)
        autoUpdateScore = (
          /** @type { [Score] } */ scores,
          /** @type { Score } */ current,
          inc
        ) => {
          for (const score of scores) {
            if (score === current) {
              score.pushValue(score.value + inc)
            } else {
              score.pushValue(
                scores.length !== 2 ? score.value : score.value + sum - inc
              )
            }
          }
        }
    }
    const increRes = new IncrementsRestraint(desc.name, autoUpdateScore)
    return increRes
  }

  constructor (type = '', autoUpdateScore = (scores, current, inc = 0) => any) {
    this.type = type
    this.autoUpdateScore = autoUpdateScore
  }
}

class Type {
  constructor (desc) {
    /** @type { string } */
    this.name = desc.name || ''
    /** @type { Ordinal } */
    this.ordinal = Ordinal.getOrdinal(desc.ordinal)
    /** @type { NumberIterator } */
    this.counts = new NumberIterator(new NumberGenerator(desc.counts))
    /** @type { number } */
    this.randomName = desc.randomName ? (parseInt(desc.randomName) || 2) : 0
    /** @type { [number] } */
    this.increments = new NumberGenerator(desc.increments).toFiniteArray()
    this.incrementsRestraint = IncrementsRestraint.parse(
      desc.incrementsRestraint
    )
    this.maxScore = parseInt(desc.maxScore)
    /** @type boolean */
    this.sort = desc.sort
    /** @type boolean */
    this.inverse = desc.inverse
  }
}

class Score {
  constructor (/** @type Type */ type, idx = 0, name = '', color) {
    registerProperties(this, 'value', 'bestScore')
    this.type = type
    this.oridinal = this.type.ordinal.getValue(idx)
    this.name = name
    this.color = color
    this.reset()
  }

  reset () {
    this.value = 0
    this.bestScore = false
    this.valueStack_ = []
  }

  pushValue (value) {
    this.valueStack_.push(this.value)
    this.value = value
  }

  popValue () {
    if (this.valueStack_.length) {
      this.value = this.valueStack_.pop()
    }
  }
}

class App {
  constructor () {
    /** @type { Object.<string,HTMLElement> } */
    this.components
    /** @type { Storage | {  } } */
    this.storage
    registerProperties(
      this,
      'menus',
      'scores',
      'selectedScore',
      'increaseScores',
      'maxScore'
    )
  }

  initData (data) {
    if (data.theme) {
      const host = document.body
      host.style.setProperty('--primary', data.theme.primary)
      host.style.setProperty('--primary-color', data.theme.primaryColor)
    }
    if (data.ordinals) {
      for (const oridinal of data.ordinals) {
        Ordinal.setOridinal(oridinal)
      }
    }
    /** @type { [Type] } */
    this.types = data.types.map((type) => new Type(type))
    /** @type { [string] } */
    this.colors_ = data.colors
  }

  start () {
    this.increaseScore = this.increaseScore.bind(this)
    this.selectScore = this.selectScore.bind(this)
    this.nameGenerator_ = new RandomNameGenerator()
    this.decreaseMenuItem = new MenuItem('-', () => this.decrease_())
    this.increaseMenuItem = new MenuItem('+', () => this.increase_())
    this.menus = [
      new MenuItem('新建', () => this.newRace_()),
      new MenuItem('撤销', () => this.undo_()),
      this.decreaseMenuItem,
      this.increaseMenuItem,
      ...(
        this.types && this.types.length > 1
          ? Array.from(
              this.types,
              (type) => new MenuItem(type.name, () => this.useType_(type))
            )
          : [])
    ]
    /** @type { [Score ] } */
    this.scores
    this.useType_(this.types[0])
  }

  selectScore (score) {
    if (this.selectedScore !== score) {
      /** @type { Score } */
      this.selectedScore = score
      if (this.increaseScores.length === 1) {
        this.increaseScore(this.increaseScores[0])
      }
    }
  }

  undo_ () {
    for (const score of this.scores) {
      score.popValue()
    }
    this.updateStatistic_()
  }

  increaseScore (/** @type { number } */ scoreValue) {
    if (this.selectedScore) {
      if (this.currentType_.incrementsRestraint) {
        this.currentType_.incrementsRestraint.autoUpdateScore(
          this.scores,
          this.selectedScore,
          scoreValue
        )
      } else {
        this.selectedScore.pushValue(this.selectedScore.value + scoreValue)
        for (const score of this.scores) {
          if (score === this.selectedScore) {
            continue
          }
          score.pushValue(score.value)
        }
      }
      this.selectedScore = null
      this.updateStatistic_()
    }
  }

  updateStatistic_ () {
    if (this.currentType_.sort) {
      const inverse = this.currentType_.inverse
      this.scores = inverse
        ? this.scores.sort((l, r) => l.value - r.value)
        : this.scores.sort((l, r) => r.value - l.value)
    }
    if (isNaN(this.currentType_.maxScore)) {
      const sortedScore = [...this.scores].sort((l, r) => r.value - l.value)
      this.maxScore = Math.max(sortedScore[0].value, 0)
    }
    for (const score of this.scores) {
      score.bestScore = score.value >= this.maxScore
    }
  }

  newRace_ () {
    this.scores.forEach((s) => s.reset())
    this.generateScores_()
    this.maxScore = isNaN(this.currentType_.maxScore)
      ? 0
      : this.currentType_.maxScore
  }

  decrease_ () {
    if (!this.currentType_.counts.goback()) {
      return
    }
    this.generateScores_()
  }

  increase_ () {
    if (!this.currentType_.counts.goforward()) {
      return
    }
    this.generateScores_()
  }

  generateScores_ () {
    let scores = this.scores
    const count = this.currentType_.counts.current
    const toIncrease = count - scores.length
    if (toIncrease < 0) {
      scores = scores.slice(0, count)
    } else if (toIncrease > 0) {
      scores.push(
        ...Array.from(
          { length: toIncrease },
          (_, i) =>
            new Score(
              this.currentType_,
              i + this.scores.length,
              this.currentType_.randomName ? this.nameGenerator_.generate(this.currentType_.randomName) : '',
              this.colors_[(i + this.scores.length) % this.colors_.length]
            )
        )
      )
    }

    this.scores = scores
  }

  useType_ (/** @type Type */ type) {
    if (this.currentType_ === type) {
      return
    }
    /** @type { Type } */
    this.currentType_ = type
    this.scores = []
    this.increaseScores = this.currentType_.increments
    this.newRace_()
  }
}
