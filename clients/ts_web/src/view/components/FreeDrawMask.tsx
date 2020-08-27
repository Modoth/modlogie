import React, { useEffect } from 'react'
import './FreeDrawMask.less'
import classNames from 'classnames'

let p = {} as any;
export default function FreeDrawMask(props: { enabled: boolean, size: number, color: string, earse: boolean, hidden: boolean }) {
    const ref = React.createRef<HTMLCanvasElement>()
    p = props;
    useEffect(() => {
        var canvas = ref.current!
        canvas.height = parseFloat(getComputedStyle(canvas).height);
        canvas.width = parseFloat(getComputedStyle(canvas).width);
        const getPos = (ev: MouseEvent | TouchEvent): [number, number] => {
            var rec = canvas.getClientRects()
            if (ev instanceof MouseEvent) {
                return [ev.x - rec[0].x, ev.y - rec[0].y]
            } else {
                var e = ev.touches[0]
                return [e.clientX - rec[0].x, e.clientY - rec[0].y]
            }
        }
        var drawing = false;
        let x = 0;
        let y = 0;
        const startDraw = (ev: MouseEvent | TouchEvent) => {
            drawing = true;
            [x, y] = getPos(ev)
        }
        const stopDraw = () => {
            drawing = false;
        }
        const draw = (ev: MouseEvent | TouchEvent) => {
            if (!drawing) {
                return
            }
            if (window.TouchEvent && ev instanceof window.TouchEvent && ev.touches.length > 1) {
                return
            }
            ev.stopPropagation();
            ev.preventDefault()

            let [tx, ty] = getPos(ev)
            var ctx = canvas.getContext('2d')!
            ctx.save()
            if (p.earse) {
                ctx.clearRect(Math.min(x, tx), Math.min(y, ty), Math.abs(x - tx), Math.abs(y - ty))
            } else {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.size;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(tx, ty);
                ctx.stroke();
            }

            x = tx;
            y = ty;
            ctx.restore()
        }
        canvas.onmousedown = startDraw;
        canvas.ontouchstart = startDraw;
        canvas.onmousemove = draw;
        canvas.ontouchmove = draw;
        canvas.onmouseup = stopDraw
        canvas.ontouchend = stopDraw
        canvas.onmouseleave = stopDraw
        canvas.ontouchend = stopDraw
    }, [])
    return <canvas ref={ref} className={classNames("free-draw", props.enabled ? 'free-draw-enabled' : '', props.hidden ? 'hidden' : '')}></canvas>
}