export class WordsClozeGenerator {
  constructor (/** @type string[] */ dataSource) {
    /** @private */
    this.dataSource_ = dataSource
    this.analysis_(dataSource)
  }

  /** @private */
  analysis_ (dataSource) {
    this.chars_ = [
      ...new Set(
        Array.from(this.dataSource_.join(''), (c) => c.toLocaleLowerCase())
      )
    ].sort()
  }

  generate (reqWidth, reqHeight) {
    const width = reqWidth
    const height = reqHeight
    let remain = 0
    const matric = Array.from({ length: height }, (_, j) =>
      Array.from({ length: width }, (_, i) => {
        const cell =
          Math.random() > 0.5
            ? Math.random() > 0.7
                ? {
                    class: ClozeCellClass.PreInsert,
                    content: this.chars_[(i + j * width) % this.chars_.length]
                  }
                : { class: ClozeCellClass.UserInsert }
            : null
        if (
          cell &&
          cell.class === ClozeCellClass.UserInsert &&
          cell.content === undefined
        ) {
          remain++
        }
        return cell
      })
    )
    return new Cloze(
      matric,
      width,
      height,
      remain,
      this.check_.bind(this),
      this.getOptions_.bind(this)
    )
  }

  check_ (x, y, value, cloze) {
    return true
  }

  getOptions_ (x, y, cloze) {
    return this.chars_
  }
}
