export type DragPosition = [number, number]
export type DragHandler = {(pos:DragPosition):void}

const registerDragMove = (document:Document, target:HTMLElement, start:DragHandler, moving:DragHandler, end:{():void}) => {
  let isMoving = false
  const getPos = (ev:TouchEvent | MouseEvent) :DragPosition => {
    if ('touches' in ev) {
      return [ev.touches[0].screenX, ev.touches[0].screenY]
    } else {
      return [ev.screenX, ev.screenY]
    }
  }
  const dragStart = (ev:any) => {
    isMoving = true
    start(getPos(ev))
  }
  const dragEnd = (ev:any) => {
    if (isMoving) {
      end()
    }
    isMoving = false
  }
  const drag = (ev:any) => {
    if (isMoving) {
      ev.preventDefault()
      moving(getPos(ev))
    }
  }
  target.addEventListener('mousedown', dragStart, false)
  document.addEventListener('mouseup', dragEnd, false)
  document.addEventListener('mousemove', drag, false)
  target.addEventListener('touchstart', dragStart, false)
  document.addEventListener('touchend', dragEnd, false)
  document.addEventListener('touchmove', drag, { passive: false })

  return () => {
    target.removeEventListener('mousedown', dragStart)
    document.removeEventListener('mouseup', dragEnd)
    document.removeEventListener('mousemove', drag)
    target.removeEventListener('touchstart', dragStart)
    document.removeEventListener('touchend', dragEnd)
    document.removeEventListener('touchmove', drag)
  }
}

export default registerDragMove
