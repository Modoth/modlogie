export class Pager {
  constructor (reader, render) {
    this.reader = reader
    this.render = render
    this.fetchMoreTask = false
    this.value = ''
    this.getValue = () => this.reader.cache()
    this.canFetchMore = true
  }

  fetchMore () {
    if (this.fetchMoreTask) {
      return this.fetchMoreTask
    }
    const cancleSource = this.pagingCancleSource
    this.fetchMoreTask = this.reader.read().then(([_, finished]) => {
      if (cancleSource === this.pagingCancleSource && !cancleSource.cancled) {
        this.canFetchMore = !finished
        this.fetchMoreTask = null
      }
    })
    return this.fetchMoreTask
  }

  pagingForward () {
    if (this.pagingForwardTask) {
      return this.pagingForwardTask
    } else {
      const cancleSource = this.pagingCancleSource
      const startPage = this.lastPagedPage
      const startOffset = this.lastPagedOffset
      const onpage = (idx, offset, nextOffset, finished) => {
        if (cancleSource !== this.pagingCancleSource || cancleSource.cancled) {
          return
        }
        if (finished && this.canFetchMore) {
          this.lastPagedOffset = offset
          this.lastPagedPage += idx
          return
        }
        idx += startPage
        this.pages.set(idx, { offset, nextOffset })
        if (this.waitingPages.has(idx)) {
          const resolve = this.waitingPages.get(idx)
          this.waitingPages.delete(idx)
          resolve()
        }
      }
      this.pagingForwardTask = this.render.page(this.getValue(), startOffset, false, onpage, cancleSource).then(() => {
        if (cancleSource === this.pagingCancleSource && !cancleSource.cancled) {
          this.pagingForwardTask = null
          if (!this.canFetchMore) {
            this.releaseWaitingPages(1)
          } else if (!this.fetchMoreTask) {
            this.fetchMore().then(() => this.pagingForward())
          }
        }
      })
      return this.pagingForwardTask
    }
  }

  pagingBackword () {
    if (this.pagingBackwordTask) {
      return this.pagingBackwordTask
    } else {
      const cancleSource = this.pagingCancleSource
      let firstPage = 0
      const onpage = (idx, offset, nextOffset) => {
        if (cancleSource !== this.pagingCancleSource || cancleSource.cancled) {
          return
        }
        if (idx < firstPage) {
          firstPage = idx
        }
        this.pages.set(idx, { offset, nextOffset })
        if (this.waitingPages.has(idx)) {
          const resolve = this.waitingPages.get(idx)
          this.waitingPages.delete(idx)
          resolve()
        }
      }
      this.pagingBackwordTask = this.render.page(this.getValue(), this.zeroOffset, true, onpage, cancleSource).then(() => {
        if (cancleSource === this.pagingCancleSource && !cancleSource.cancled) {
          this.pagingBackwordTask = null
          this.releaseWaitingPages(-1)
        }
      })
      return this.pagingBackwordTask
    }
  }

  async paging () {
    if (this.zeroOffset) {
      while (this.getValue().length < this.zeroOffset) {
        if (!this.canFetchMore) {
          break
        }
        if (this.fetchMoreTask) {
          await this.fetchMoreTask
        } else {
          await this.fetchMore()
        }
      }
    }
    this.lastPagedOffset = this.zeroOffset
    await this.pagingForward()
    if (this.zeroOffset) {
      await this.pagingBackword()
    }
  }

  /** @returns {Promise<{offset:number, nextOffset?:number}|undefined>} */
  async getPage (/** @type number */pageIdx) {
    if (this.pages.has(pageIdx)) {
      return this.pages.get(pageIdx)
    } else {
      if (!this.pagingForwardTask && !this.canFetchMore && !this.pagingBackwordTask) {
        return undefined
      }
      return new Promise(resolve => {
        this.waitingPages.set(pageIdx, resolve)
      }).then(() => this.pages.get(pageIdx))
    }
  }

  releaseWaitingPages (type = 0) {
    if (!this.waitingPages) {
      return
    }
    let releases = Array.from(this.waitingPages)
    if (this.waitingPages) {
      switch (type) {
        case -1:
          releases = releases.filter(([i]) => i < 0)
          break
        case 1:
          releases = releases.filter(([i]) => i >= 0)
          break
        default:
          break
      }
      for (const [i, r] of releases) {
        r()
        this.waitingPages.delete(i)
      }
    }
  }

  async reset (/** @type number */zeroOffset) {
    this.releaseWaitingPages()
    this.lastPagedPage = 0
    this.lastPagedOffset = 0
    this.zeroOffset = zeroOffset
    this.fetchMoreTask = undefined
    this.pagingForwardTask = undefined
    this.pagingBackwordTask = undefined

    this.waitingPages = new Map()
    this.pages = new Map()
    if (this.pagingCancleSource) {
      this.pagingCancleSource.cancled = true
    }
    this.pagingCancleSource = { cancled: false }
    this.paging()
  }
}
