import './CaptureDict.less'
import FloatDict, { FloatDictPosition } from './FloatDict'
import React, { useState, useEffect } from 'react'

const maxEgLength = 100
const getEg = (p:string, anchorOffset:number) => {
  if (p.length <= maxEgLength) {
    return p
  }
  const start = Math.max(anchorOffset - p.length / 2, 0)
  const end = start + maxEgLength
  return `${start === 0 ? '' : '...'}${p.slice(start, end)}${start === p.length ? '' : '...'}`
}
export default function CaptureDict (props:{offset:number}) {
  const [word, setWord] = useState('')
  const [eg, setEg] = useState('')
  const [mousePos, setMousePos] = useState<FloatDictPosition>()
  useEffect(() => {
    const handleSelected = async () => {
      const section = window.getSelection()
      const node = section?.anchorNode as any
      const p :string = (node?.innerText || node?.wholeText || '').trim()
      const eg = getEg(p, section!.anchorOffset)
      const w = section?.toString()?.trim() || ''
      setWord(w)
      setEg(eg)
    }
    const handlePosition = (ev: MouseEvent | TouchEvent) => {
      const mousePos : FloatDictPosition = ev instanceof MouseEvent ? [ev.clientX, ev.clientY] : (ev.touches[0] ? [ev.touches[0].clientX, ev.touches[0].clientY] : undefined)
      if (mousePos) {
        mousePos[1] += props.offset || 0
      }
      setMousePos(mousePos)
    }
    document.addEventListener('selectionchange', handleSelected)
    document.addEventListener('mousedown', handlePosition)
    document.addEventListener('touchstart', handlePosition)
    document.addEventListener('touchmove', handlePosition)
    document.addEventListener('mousemove', handlePosition)
    return function cleanup () {
      document.removeEventListener('selectionchange', handleSelected)
      document.removeEventListener('mousedown', handlePosition)
      document.removeEventListener('touchstart', handlePosition)
      document.removeEventListener('touchmove', handlePosition)
      document.removeEventListener('mousemove', handlePosition)
    }
  }, [])
  return <FloatDict word={word} eg={eg} position={mousePos}></FloatDict>
}
