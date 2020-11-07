export let ClozeCellClass = {
  Blank: 'blank',
  PreInsert: 'pre-insert',
  UserInsert: 'user-insert',
}

export class Cloze {
  constructor(
    /**@type { [CellData][] } */ matric,
    width,
    height,
    /**@type number */ remain,
    checkValue,
    getOptions,
    group = 0
  ) {
    /**@private */
    this.width_ = width
    /**@private */
    this.height_ = height
    this.group_ = group
    /**@private */
    this.matric_ = matric
    this.remain_ = remain
    this.checkValue_ = checkValue
    this.getOptions_ = getOptions
  }

  get(x, y) {
    if (!this.checkRange_(x, y)) {
      return undefined
    }
    return this.matric_[y][x]
  }

  getOptions(x, y) {
    if (!this.checkRange_(x, y)) {
      return []
    }
    return this.getOptions_(x, y, this)
  }

  set(x, y, value) {
    if (!this.checkRange_(x, y)) {
      return false
    }
    if (this.matric_[y][x].class !== ClozeCellClass.UserInsert) {
      return false
    }
    if (!this.checkValue_(x, y, value, this)) {
      return false
    }
    if (this.matric_[y][x].content !== undefined) {
      this.remain_++
    }
    this.matric_[y][x].content = value || undefined
    if (this.matric_[y][x].content !== undefined) {
      this.remain_--
    }
    return true
  }

  get group() {
    return this.group_
  }

  get remain() {
    return this.remain_
  }

  get width() {
    return this.width_
  }

  get height() {
    return this.height_
  }

  /**@private */
  checkRange_(x, y) {
    return x >= 0 && x < this.width_ && y >= 0 && y < this.height_
  }
}
