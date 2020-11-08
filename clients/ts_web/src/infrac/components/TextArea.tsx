import './TextArea.less'
import { TextRender } from './TextRender'
import IAsyncTextReader from '../Lang/IAsyncTextReader'
import React, { useEffect } from 'react'
import ResizeWatcher from '../Lang/ResizeWatcher'

class TextAreaManager {
  constructor (private value: string, private reader?: IAsyncTextReader) {
    this.value = this.value || ''
    this.getValue = this.reader ? () => this.reader!.cache() : () => this.value
    this.hadMoreContent = !!this.reader
    this.resizeWatcher = new ResizeWatcher()
    const tryReload = () => {
      if (this.container) {
        this.reload()
      }
    }
    this.resizeWatcher.register(tryReload)
  }

    private container: HTMLElement
    private resizeWatcher: ResizeWatcher
    private getValue: { (): string }
    private render: TextRender
    private clickResions = [
      '112',
      '102',
      '122'
    ]

    private clickResionsHeight = this.clickResions.length
    private clickResionsWidth = this.clickResions[0].length
    private reloadCancleSource: { cancled: boolean }
    private pages: Map<number, { offset: number, nextOffset?: number }>
    private currentTheme: any
    private currentPageIdx = 0

    private handleClicks (ev: MouseEvent) {
      const { offsetX: x, offsetY: y } = ev
      const px = Math.floor(
        (x * this.clickResionsWidth) / this.container.clientWidth
      )
      const py = Math.floor(
        (y * this.clickResionsHeight) / this.container.clientHeight
      )
      switch (parseInt(this.clickResions[py][px])) {
        case 1:
          this.pageUp()
          break
        case 2:
          this.pageDown()
          break
        case 3:
          break
        case 4:
          break
        case 5:
          break
        case 6:
          break
      }
    }

    async pageUp () {
      await this.loadPage(this.currentPageIdx - 1)
    }

    async pageDown () {
      await this.loadPage(this.currentPageIdx + 1)
    }

    private lastPagedOffset = 0;
    private lastPagedPage = 0;
    private hadMoreContent: boolean;
    private fetchingMore = false;

    async fetchMore () {
      const [_, finished] = await this.reader!.read()
      this.hadMoreContent = !finished
    }

    async paging () {
      if (this.reloadCancleSource) {
        this.reloadCancleSource.cancled = true
      }
      const cancleSource = { cancled: false }
      this.reloadCancleSource = cancleSource
      const startPage = this.lastPagedPage
      const startOffset = this.lastPagedOffset
      const onpage = (page: number, offset: number, nextOffset: number, finished?: boolean) => {
        if (finished && this.hadMoreContent) {
          this.lastPagedOffset = offset
          this.lastPagedPage += page
          return
        }
        page += startPage
        this.pages.set(page, { offset, nextOffset })
      }
      await this.render!.page(
        this.getValue(),
        startOffset,
        false,
        onpage,
        cancleSource
      )
    }

    async loadPage (pageIdx: number) {
      if (pageIdx < 0) {
        return
      }
      if (this.pages.has(pageIdx)) {
        this.currentPageIdx = pageIdx
        const page = this.pages.get(this.currentPageIdx)!
        const nextOffset =
                page.offset +
                this.render.rend(this.getValue(), page.offset, page.nextOffset)
        if (
          this.pages.has(this.currentPageIdx + 1) &&
                this.pages.get(this.currentPageIdx + 1)!.offset !== nextOffset &&
                nextOffset !== this.getValue.length
        ) {
          this.paging()
        }
      } else if (this.hadMoreContent && !this.fetchingMore) {
        this.fetchingMore = true
        await this.fetchMore()
        this.paging()
        this.fetchingMore = false
        this.loadPage(pageIdx)
      }
    }

    async reload () {
      this.currentPageIdx = 0
      this.lastPagedPage = 0
      this.lastPagedOffset = 0
      this.fetchingMore = false
      this.pages = new Map()
      const style = window.getComputedStyle(this.container)
      this.currentTheme = { fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000' }
      this.render.setStyle(this.currentTheme)
      this.paging()
      await this.loadPage(0)
    }

    connect (newContainer?: HTMLElement) {
      if (this.container === newContainer) {
        return
      }
      if (this.container) {
        this.container.onclick = null
      }
      this.container = newContainer!
      const { container } = this
      if (!container) {
        return
      }
      container.onclick = this.handleClicks.bind(this)
      container.innerHTML = ''
      const render = new TextRender(container)
      this.render = render
      this.reload()
    }

    dispose () {
      this.resizeWatcher.dispose()
    }
}

export default function TextArea (props: { value: string | IAsyncTextReader }) {
  const manager = new TextAreaManager((typeof props.value === 'string') ? props.value as string : '', (typeof props.value !== 'string') ? props.value as IAsyncTextReader : undefined)
  useEffect(() => {
    return () => {
      manager.dispose()
    }
  }, [])
  return <div className="text-area" ref={div => {
    manager.connect(div || undefined)
  }}></div>
}