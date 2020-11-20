import './CaptureDict.less'
import FloatDict, { FloatDictPosition } from './FloatDict'
import React, { useState, useEffect } from 'react'

const maxEgLength = 100
const endingCharacters = /\.|\?|!|。|？|！|\n/
const getEg = (p:string, wordStart:number, wordEnd:number) => {
  const trim = (p:string) => {
    p = p.replace(/(\s|\n|,|:|：|、|，|“)*$/g, '')
    p = p.replace(/^(\s|\n|,|:|：|、|，|”)*/g, '')
    return p
  }
  if (p.length <= maxEgLength) {
    return trim(p)
  }
  let start = Math.max(wordStart - maxEgLength / 2)
  if (start <= 0) {
    start = 0
  } else {
    const match = p.match(endingCharacters)
    if (match && match.index !== undefined && match.index < wordStart) {
      start += match.index + 1
    }
  }
  let end = start + maxEgLength
  let surfix = '...'
  if (end >= p.length) {
    end = p.length
    surfix = ''
  }
  const match = p.slice(wordEnd).match(endingCharacters)
  if (match && match.index !== undefined) {
    end = wordEnd + match.index
  }
  const eg = trim(p.slice(start, end))
  return `${eg}${surfix}`
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
      let w = section?.toString() || ''
      if (!w) {
        setWord('')
        setEg('')
        return
      }
      const eg = getEg(p, section!.anchorOffset, section!.anchorOffset + w.length)
      w = w.trim()
      console.log(eg, w)
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
