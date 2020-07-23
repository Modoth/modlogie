export default class ITextImageService {
    generate(txt: string, fontSize?: number, color?: string, rotate?: number): string {
        throw new Error('Not Implemented.')
    }
}

export class TextImageServiceSingleton implements ITextImageService {
    //todo
    generate(txt: string, fontSize?: number, color?: string, rotate?: number): string {
        var canvas = document.createElement('canvas')
        var ctx = canvas.getContext("2d")
        if (!ctx) {
            return "";
        }
        fontSize = fontSize || parseInt(getComputedStyle(document.body).fontSize)
        if (color) {
            ctx.fillStyle = color;
        }
        ctx.font = `${fontSize}px sans-serif`
        var size = ctx.measureText(txt)
        var fixPadding = 0.25 * fontSize;
        var width = size.width
        var lineHeight = fontSize * 1.5
        var height = lineHeight + 2 * fixPadding
        canvas.width = width
        canvas.height = height
        ctx.font = `${fontSize}px sans-serif`
        if (color) {
            ctx.fillStyle = color;
        }
        ctx.transform(1, 0, 0, 1, 0, lineHeight + fixPadding)
        if(rotate){
            ctx.rotate(rotate * Math.PI / 180)
        }

        ctx.fillText(txt, 0, 0)
        return canvas.toDataURL("image/png")
    }
}