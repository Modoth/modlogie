import './CaptureDict.less'
import FloatDict, { FloatDictPosition } from './FloatDict'
import React, { useState, useEffect } from 'react'

export default function CaptureDict (props:{offset:number}) {
  const [word, setWord] = useState('')
  const [mousePos, setMousePos] = useState<FloatDictPosition>()
  useEffect(() => {
    const handleSelected = async () => {
      const w = window.getSelection()?.toString()?.trim() || ''
      setWord(w)
    }
    const handlePosition = (ev: MouseEvent | TouchEvent) => {
      const mousePos : FloatDictPosition = ev instanceof MouseEvent ? [ev.clientX, ev.clientY] : (ev.touches[0] ? [ev.touches[0].clientX, ev.touches[0].clientY] : undefined)
      if (mousePos) {
        mousePos[1] += props.offset || 0
      }
      setMousePos(mousePos)
    }
    document.addEventListener('mousedown', handlePosition)
    document.addEventListener('touchstart', handlePosition)
    document.addEventListener('selectionchange', handleSelected)
    document.addEventListener('touchmove', handlePosition)
    document.addEventListener('mousemove', handleSelected)
    return function cleanup () {
      document.removeEventListener('selectionchange', handleSelected)
      document.removeEventListener('mousedown', handlePosition)
      document.removeEventListener('touchstart', handlePosition)
      document.removeEventListener('touchmove', handlePosition)
      document.removeEventListener('mousemove', handleSelected)
    }
  }, [])
  return <FloatDict word={word} position={mousePos}></FloatDict>
}
