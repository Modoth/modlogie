import ITextImageService from './ITextImageService'

export default class TextImageServiceSingleton implements ITextImageService {
  // todo
  generate (txt: string, fontSize?: number, color?: string, rotate?: number): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return ''
    }
    fontSize = fontSize || parseInt(getComputedStyle(document.body).fontSize)
    if (color) {
      ctx.fillStyle = color
    }
    ctx.font = `${fontSize}px sans-serif`
    const size = ctx.measureText(txt)
    const fixPadding = 0.25 * fontSize
    const width = size.width
    const lineHeight = fontSize * 1.5
    const height = lineHeight + 2 * fixPadding
    canvas.width = width
    canvas.height = height
    ctx.font = `${fontSize}px sans-serif`
    if (color) {
      ctx.fillStyle = color
    }
    ctx.transform(1, 0, 0, 1, 0, lineHeight + fixPadding)
    if (rotate) {
      ctx.rotate(rotate * Math.PI / 180)
    }

    ctx.fillText(txt, 0, 0)
    return canvas.toDataURL('image/png')
  }
}
