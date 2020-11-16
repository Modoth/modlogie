import { sleep } from '../commons/sleep.js'

class LineInfo {
  constructor (
    /** @type number */ x,
    /** @type number */ y,
    /** @type number */ ymin,
    /** @type number */ yRealMin,
    /** @type number */ yRealMax,
    /** @type number */ offset,
    /** @type string */ text
  ) {
    this.x = x
    this.y = y
    this.ymin = ymin
    this.yRealMax = yRealMax
    this.yRealMin = yRealMin
    this.offset = offset
    this.text = text
  }
}

export class TextRender {
  constructor (/** @type HTMLElement */ root) {
    this.root_ = root
    this.canvas_ = document.createElement('canvas')
    this.measureCanvas_ = document.createElement('canvas')
    this.canvas_.onclick = (ev) => this.onMouseClick_(ev)
    this.canvas_.onmousedown = (ev) => this.onMouseDown_(ev)
    this.canvas_.onmousemove = (ev) => this.onMouseMove_(ev)
    this.canvas_.onmouseup = (ev) => this.onMouseUp_(ev)
    this.canvas_.onmouseleave = (ev) => this.onMouseUp_(ev)
    this.root_.appendChild(this.canvas_)
    /** @type LineInfo[] */
    this.lineInfos_ = []
    this.movingCheckPeriod_ = 200
  }

  onMouseClick_ () {
    if (this.allowCancleSelection_) {
      this.select_(null, null)
    }
  }

  onMouseDown_ (ev) {
    this.isMouseDown_ = true
    setTimeout(() => {
      if (!this.isMouseDown_) {
        return
      }
      this.isSelecting_ = true
      this.allowCancleSelection_ = false
      this.lastMovingCheck_ = 0
      this.mouseDownChar_ = { toGetFrom: ev }
    }, 300)
  }

  onMouseMove_ (ev) {
    if (!this.isSelecting_ || !this.mouseDownChar_) {
      return
    }
    const now = Date.now()
    if (now - this.lastMovingCheck_ < this.movingCheckPeriod_) {
      return
    }
    this.lastMovingCheck_ = now
    if (this.mouseDownChar_.toGetFrom) {
      this.mouseDownChar_ = this.findCharAt_(this.mouseDownChar_.toGetFrom)
      return
    }
    this.mouseChar_ = this.findCharAt_(ev)
    this.mouseChar_ && this.select_(this.mouseDownChar_, this.mouseChar_)
  }

  onMouseUp_ (/** @type MouseEvent */ ev) {
    this.isMouseDown_ = false
    this.mouseDownChar_ = null
    if (this.isSelecting_) {
      this.isSelecting_ = false
      this.selection_ = this.getSelection_(
        this.hightlightStartChar_,
        this.hightlightEndChar_
      )
      setTimeout(() => {
        this.allowCancleSelection_ = true
        if (this.onSelectChange) {
          this.onSelectChange(this.selection_)
        }
      }, 0)
    }
  }

  getHighlightSlices_ (start, end) {
    const redraws = []
    if (start.y === end.y) {
      const left = Math.min(start.x, end.x)
      const right = Math.max(start.x, end.x)
      if (left > 0) {
        redraws.push({
          x: 0,
          y: start.y,
          xend: left,
          hightlight: 0
        })
      }
      redraws.push({
        x: left,
        y: start.y,
        xend: right + 1,
        hightlight: 1
      })
      redraws.push({
        x: right + 1,
        y: start.y,
        hightlight: 0
      })
    } else {
      let bottom, top
      if (start.y > end.y) {
        bottom = start
        top = end
      } else {
        bottom = end
        top = start
      }
      redraws.push({
        x: 0,
        y: top.y,
        xend: top.x,
        hightlight: 0
      })
      redraws.push({
        x: top.x,
        y: top.y,
        hightlight: 1
      })
      for (let i = top.y + 1; i < bottom.y; i++) {
        redraws.push({
          x: 0,
          y: i,
          hightlight: 1
        })
      }
      redraws.push({
        x: 0,
        y: bottom.y,
        xend: bottom.x + 1,
        hightlight: 1
      })
      redraws.push({
        x: bottom.x + 1,
        y: bottom.y,
        hightlight: 0
      })
    }
    return redraws
  }

  resetHighlight_ (start, end, clearOnly) {
    const top = start.y
    const bottom = end.y
    this.context_.clearRect(
      this.lineInfos_[top].x,
      this.lineInfos_[top].ymin,
      this.canvas_.width,
      this.lineInfos_[bottom].yRealMax - this.lineInfos_[top].ymin
    )
    if (clearOnly) {
      return
    }
    for (let i = top; i <= bottom; i++) {
      const line = this.lineInfos_[i]
      this.context_.fillText(line.text, line.x, line.y)
    }
  }

  hightlight_ (start, end) {
    this.resetHighlight_(start, end, true)
    const slices = this.getHighlightSlices_(start, end)
    const style = this.context_.fillStyle
    const hightlightStyle = this.hightlightColor_

    for (const i of slices) {
      this.context_.fillStyle = i.hightlight ? hightlightStyle : style
      const line = this.lineInfos_[i.y]
      const offset =
                line.x + this.context_.measureText(line.text.slice(0, i.x)).width
      this.context_.fillText(line.text.slice(i.x, i.xend), offset, line.y)
    }

    this.context_.fillStyle = style
  }

  sort_ (start, end) {
    if (!start || !end) {
      return [null, null]
    }
    if (start.y === end.y) {
      if (start.x > end.x) {
        return [end, start]
      } else {
        return [start, end]
      }
    }
    if (start.y > end.y) {
      return [end, start]
    } else {
      return [start, end]
    }
  }

  getSelection_ (start, end) {
    if (!start || !end) {
      return null
    }
    const startLine = this.lineInfos_[start.y]
    const endLine = this.lineInfos_[end.y]
    const offset = startLine.offset + start.x
    const endOffset = endLine.offset + end.x + 1
    const text = this.content_.slice(offset, endOffset)
    const length = text.length
    return {
      offset,
      text,
      length
    }
  }

  select_ (start, end) {
    ;[start, end] = this.sort_(start, end)
    if (
      start &&
            end &&
            this.hightlightStartChar_ &&
            this.hightlightStartChar_.x === start.x &&
            this.hightlightStartChar_.y === start.y &&
            this.hightlightEndChar_ &&
            this.hightlightEndChar_.x === end.x &&
            this.hightlightEndChar_.y === end.y
    ) {
      return
    }

    this.hightlightStartChar_ &&
            this.hightlightEndChar_ &&
            this.resetHighlight_(this.hightlightStartChar_, this.hightlightEndChar_)

    this.hightlightStartChar_ = start
    this.hightlightEndChar_ = end
    this.hightlightStartChar_ &&
            this.hightlightEndChar_ &&
            this.hightlight_(this.hightlightStartChar_, this.hightlightEndChar_)
  }

  findCharAt_ ({ x: canvasX, y: canvasY }) {
    const y = this.lineInfos_.findIndex(
      (l) => l.yRealMax > canvasY && l.yRealMin < canvasY
    )
    const line = this.lineInfos_[y]
    if (!line) {
      return null
    }
    const char = this.getLength_(
      this.context_,
      line.text,
      canvasX,
      this.fullLineLength_,
      this.perWidth_
    )
    const x = char.length - 1
    return { x, y }
  }

  getOneLine_ (/** @type string */ content, /** @type number */ offset) {
    let end = offset
    while (content[end] && content[end] !== '\n') {
      end++
    }
    return [
      content.slice(offset, content[end - 1] === '\r' ? end - 1 : end),
      end + 1
    ]
  }

  getLength_ (ctx, p, pageWidth, fullLineLength, perWidth) {
    const res = this.findMax_(
      0,
      p.length,
      fullLineLength,
      pageWidth,
      perWidth,
      (x, y, dx) => {
        const next = x + dx
        const absDy = ctx.measureText(
          dx > 0 ? p.slice(x, next) : p.slice(next, x)
        ).width
        y = dx > 0 ? y + absDy : y - absDy
        return { x: next, y }
      }
    )
    return {
      length: res.x,
      fullLineLength: res.xinit,
      perWidth: res.k,
      width: res.y
    }
  }

  findMax_ (
    xmin,
    xmax,
    xinit,
    ymax,
    k,
    /** @type {( x:number,  y:number, dx:number)=>{x:number, y:number}} */ f
  ) {
    let dx = xinit
    let x = 0
    let y = 0
    let [min, max] = [xmin, xmax]
    let comfirmax_ = false
    let comfirmin_ = false
    let remainTimes = 1000
    let checkMax = false
    while (true) {
      if (remainTimes-- < 0) {
        throw new Error('timeout')
      }
      ; ({ x, y } = f(x, y, dx))
      k = y / x
      const dy = ymax - y
      if (dy === 0) {
        if (x > xmax) {
          x = xmax
          break
        } else {
          xinit = x
          break
        }
      }
      if (dy > 0) {
        if (x > xmax) {
          x = xmax
          break
        }
        if (dx === -1) {
          xinit = x
          break
        }
        min = Math.max(min, x)
        comfirmin_ = true
        dx = Math.ceil(dy / k)
      } else {
        if (dx === 1) {
          x--
          xinit = x
          break
        }
        comfirmax_ = true
        max = Math.min(max, x)
        dx = Math.floor(dy / k)
      }
      if (!checkMax && max === min + 1) {
        dx = max - x
        checkMax = true
        continue
      }
      if (max <= min + 1) {
        x = min
        xinit = x
        break
      }
      if (comfirmax_ && comfirmin_) {
        dx = Math.floor((max + min) / 2) - x
      } else {
        dx = Math.min(max - x, dx)
        dx = Math.max(min - x, dx)
      }
    }
    return { x, xinit, y, k }
  }

  measurePage_ (
    /** @tye HTMLCanvasElement */ canvas,
    /** @type string */ content,
    /** @type number */ offset,
    /** @type number */ fontSize,
    /** @type string */ fontFamily,
    /** @type number */ width,
    /** @type number */ height,
    /** @type number */ lineHeight,
    padding,
    includeLineInfo = true,
    hightLimit = true
  ) {
    const lineInfos = []
    canvas.width = width
    canvas.height = height
    const pageWidth = canvas.width - padding.left - padding.right
    const pageHeight = canvas.height - padding.top - padding.bottom
    let pOffset = offset
    let p
    const ctx = canvas.getContext('2d')
    ctx.font = `${fontSize}px ${fontFamily}`
    const xLength = ctx.measureText('x').width
    let top = padding.top + lineHeight
    const lowestTop = padding.top + pageHeight
    let fullLineLength = Math.floor(pageWidth / xLength)
    let perWidth = xLength
    while (true) {
      offset = pOffset
      ;[p, pOffset] = this.getOneLine_(content, pOffset)
      while (p.length) {
        const info = this.getLength_(
          ctx,
          p,
          pageWidth,
          fullLineLength,
          perWidth
        )
        fullLineLength = info.fullLineLength
        perWidth = info.perWidth
        includeLineInfo &&
                    lineInfos.push(
                      new LineInfo(
                        padding.left,
                        top,
                        top - lineHeight,
                        top - fontSize,
                        top + fontSize * 0.2,
                        offset,
                        content.slice(offset, offset + info.length)
                      )
                    )
        offset += info.length
        top += lineHeight
        if ((hightLimit && top > lowestTop) || offset >= content.length) {
          return { offset, lineInfos, fullLineLength, perWidth, top }
        }
        p = p.slice(info.length)
      }
      offset++
      top += padding.para
      if (offset >= content.length || (hightLimit && top > lowestTop)) {
        return { offset, lineInfos, fullLineLength, perWidth, top }
      }
    }
  }

  page (
    /** @type string */ content,
    /** @type number */ offset = 0,
    pagingBack = false,
    onpage = null,
    cancleToken = {}
  ) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      this.measureCanvas_.width = this.root_.clientWidth * this.ratio_
      this.measureCanvas_.height = this.root_.clientHeight * this.ratio_
      const pageWidth =
                this.measureCanvas_.width - this.padding_.left - this.padding_.right
      const pageHeight =
                this.measureCanvas_.height - this.padding_.top - this.padding_.bottom
      const ctx = this.measureCanvas_.getContext('2d')
      ctx.font = `${this.fontSize_}px ${this.fontFamily_}`
      const perWidth = ctx.measureText('x').width
      const fullLineLength = Math.floor(pageWidth / perWidth)
      const lineCount = Math.floor(pageHeight / this.lineHeight_)
      this.fullPageLength_ = fullLineLength * lineCount
      if (this.fullPageLength_ === 0) {
        return
      }
      const offsetBk = offset
      let page = 0
      if (!pagingBack) {
        while (offset < content.length) {
          const pageRes = this.measurePage_(
            this.measureCanvas_,
            content,
            offset,
            this.fontSize_,
            this.fontFamily_,
            this.measureCanvas_.width,
            this.measureCanvas_.height,
            this.lineHeight_,
            this.padding_,
            false,
            true
          )
          onpage && onpage(page, offset, undefined, pageRes.offset >= content.length)
          offset = pageRes.offset
          page++
          await sleep(0)
          if (cancleToken.cancled) {
            resolve()
            return
          }
        }

        resolve()
        return
      } else {
        page = 0
        offset = offsetBk
        while (offset > 0) {
          const maxOffset = this.measurePage_(
            this.measureCanvas_,
            content,
            offset,
            this.fontSize_,
            this.fontFamily_,
            this.measureCanvas_.width,
            this.measureCanvas_.height,
            this.lineHeight_,
            this.padding_,
            false,
            true
          ).offset

          const res = this.findMax_(
            0,
            offset,
            this.fullPageLength_,
            maxOffset - offset,
            maxOffset / this.fullPageLength_,
            (x, _, dx) => {
              x += dx
              const pageRes = this.measurePage_(
                this.measureCanvas_,
                content,
                offset - x,
                this.fontSize_,
                this.fontFamily_,
                this.measureCanvas_.width,
                this.measureCanvas_.height,
                this.lineHeight_,
                this.padding_,
                false,
                true
              )
              return {
                x: x,
                y: maxOffset - pageRes.offset
              }
            }
          )
          this.fullPageLength_ = Math.floor(maxOffset / res.xinit)
          const nextOffset = offset
          offset -= res.x
          page--
          onpage &&
                      onpage(page, Math.max(offset, 0), offset > 0 ? nextOffset : undefined)
          await sleep(0)
          if (cancleToken.cancled) {
            resolve()
            return
          }
        }
      }
      resolve()
    })
  }

  setStyle ({
    /** @type number */ fontSize,
    /** @type string */ fontFamily,
    /** @type string */ color,
    /** @type string */ hightcolor
  }) {
    const devicePixelRatio = window.devicePixelRatio || 1
    const ctx = this.canvas_.getContext('2d')
    const backingStoreRatio =
            ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio ||
            1
    this.ratio_ = devicePixelRatio / backingStoreRatio
    this.color_ = color
    this.hightlightColor_ = hightcolor
    fontSize *= this.ratio_
    this.fontSize_ = fontSize
    this.fontFamily_ = fontFamily
    this.lineHeight_ = fontSize * 1.2
    this.padding_ = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 10,
      para: 0.4 * this.lineHeight_
    }
  }

  rend (
    /** @type string */ content,
    /** @type number */ offset,
    /** @type number | undefined */ nextOffset
  ) {
    this.content_ = content.slice(offset, nextOffset)
    this.nextOffset_ = nextOffset
    this.canvas_.width = this.root_.clientWidth * this.ratio_
    this.canvas_.height = this.root_.clientHeight * this.ratio_
    this.context_ = this.canvas_.getContext('2d')
    this.context_.font = `${this.fontSize_}px ${this.fontFamily_}`
    const {
      offset: newOffset,
      lineInfos,
      fullLineLength,
      perWidth
    } = this.measurePage_(
      this.measureCanvas_,
      this.content_,
      0,
      this.fontSize_,
      this.fontFamily_,
      this.canvas_.width,
      this.canvas_.height,
      this.lineHeight_,
      this.padding_
    )
    this.fullLineLength_ = fullLineLength
    this.perWidth_ = perWidth
    this.lineInfos_ = lineInfos
    this.context_.fillStyle = this.color_
    for (const info of this.lineInfos_) {
      this.context_.fillText(info.text, info.x, info.y)
    }
    return newOffset
  }
}
