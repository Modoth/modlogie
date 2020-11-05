import React from 'react'
import './TextArea.less'
import { TextRender } from './TextRender'
import IAsyncTextReader from '../../common/IAsyncTextReader';

class TextAreaManager {
    constructor(private value: string, private reader?: IAsyncTextReader) {
        this.value = this.value || ''
    }
    private container: HTMLElement
    private render: TextRender
    private clickResions = [
        '11066666044',
        '11066666044',
        '11000000022',
        '11003330022',
        '11003330022',
        '11003330022',
        '11000000022',
        '22222222255',
        '22222222255',
    ]
    private clickResionsHeight = this.clickResions.length
    private clickResionsWidth = this.clickResions[0].length
    private reloadCancleSource: { cancled: boolean }
    private pages: Map<number, { offset: number, nextOffset?: number }>
    private zeroPageOffset: number
    private currentTheme: any
    private fontSize: number
    private currentOffset: number
    private currentPageIdx = 0

    private handleClicks(ev: MouseEvent) {
        const { offsetX: x, offsetY: y } = ev;
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
    async pageUp() {
        await this.loadPage(this.currentPageIdx - 1)
    }

    async pageDown() {
        await this.loadPage(this.currentPageIdx + 1)
    }

    async paging() {
        if (this.reloadCancleSource) {
            this.reloadCancleSource.cancled = true
        }
        const cancleSource = { cancled: false }
        this.reloadCancleSource = cancleSource
        let firstPage = 0
        const onpage = (page: number, offset: number, nextOffset: number) => {
            if (page < firstPage) {
                firstPage = page
            }
            this.pages.set(page, { offset, nextOffset })
        }
        await this.render!.page(
            this.value!,
            this.zeroPageOffset,
            onpage,
            cancleSource
        )
        if (cancleSource.cancled) {
            return
        }
        if (this.zeroPageOffset > 0) {
            let newOffsets = new Map()
            this.pages.forEach((offset, page) => newOffsets.set(page - firstPage, offset))
            this.currentPageIdx -= firstPage
            this.pages = newOffsets
            this.zeroPageOffset = 0
        }
    }

    async loadPage(pageIdx: number) {
        if (pageIdx < 0) {
            return
        }
        if (this.pages.has(pageIdx)) {
            this.currentPageIdx = pageIdx
            const page = this.pages.get(this.currentPageIdx)!
            this.currentOffset = page.offset
            const nextOffset =
                page.offset +
                this.render.rend(this.value, page.offset, page.nextOffset)
            if (
                this.pages.has(this.currentPageIdx + 1) &&
                this.pages.get(this.currentPageIdx + 1)!.offset !== nextOffset &&
                nextOffset != this.value.length
            ) {
                this.paging()
            }
        }
    }

    async reload() {
        this.pages = new Map()
        this.zeroPageOffset = this.currentOffset
        this.pages.set(0, { offset: this.currentOffset })
        this.render.setStyle(this.currentTheme)
        this.paging()
        await this.loadPage(0)
    }

    connect(newContainer?: HTMLElement) {
        if (this.container == newContainer) {
            return
        }
        if (this.container) {
            this.container.onclick = null
        }
        this.container = newContainer!
        const { container: container } = this;
        if (!container) {
            return
        }
        container.onclick = this.handleClicks.bind(this)
        container.innerHTML = ''
        const render = new TextRender(container)
        this.render = render
        const style = window.getComputedStyle(container)
        this.currentTheme = { fontSize: parseInt(style.fontSize), fontFamily: style.fontFamily, color: style.color, hightcolor: '#ff0000' }
        this.currentOffset = 0;
        if (!this.value && this.reader) {
            this.reader.read().then(([s]) => {
                this.value += s
                this.reload()
            })
        }
        else {
            this.reload()
        }
    }
}

export default function TextArea(props: { value: string | IAsyncTextReader }) {
    const manager = new TextAreaManager((typeof props.value === 'string') ? props.value as string : '', (typeof props.value !== 'string') ? props.value as IAsyncTextReader : undefined)
    return <div className="text-area" ref={div => {
        manager.connect(div || undefined)
    }}></div>
}