import './CaptureDict.less'
import DictView, { FloatDictPosition } from './DictView'
import React, { useState, useEffect } from 'react'

const isBlock = (n:Node):boolean => {
  if (n.nodeType === 3) {
    return false
  }
  if (n.nodeType !== 1) {
    return true
  }
  const e = n as HTMLElement
  const style = getComputedStyle(e)
  return !!style.display.match(/block|flex|table|grid/i)
}

const getNodeParent = (n :Node) => {
  let p:Node|null = n
  while (p && !isBlock(p)) {
    p = p.parentNode
  }
  return p
}

const textOffsetOfParent = (n:Node, p:Node) => {
  return (p.textContent || '').indexOf(n.textContent || '')
}

const maxEgLength = 150
const minEgLength = 30
const endingCharacters = new Set('。？！\n')
const endingCharactersWithSpace = new Set('.?!')
const isEndingChar = (p:string, i:number):boolean => {
  if (endingCharacters.has(p[i])) {
    return true
  }
  if (endingCharactersWithSpace.has(p[i])) {
    const next = p[i + 1]
    return next === ' ' || next === undefined || next === '\n'
  }
  return false
}
const getEg = (p:string, wordStart:number, wordEnd:number) => {
  const trim = (p:string) => {
    p = p.replace(/(\s|\n|,|:|：|、|，|“)*$/g, '')
    p = p.replace(/^(\s|\n|,|:|：|、|，|”)*/g, '')
    return p
  }
  if (p.length <= minEgLength) {
    return trim(p)
  }
  let prefix = '...'
  let start = wordEnd - maxEgLength
  if (start < 0) {
    start = 0
    prefix = ''
  }
  let preEndingCharIdx = start - 1
  for (let i = wordStart - 1; i >= start; i--) {
    if (isEndingChar(p, i)) {
      preEndingCharIdx = i
      prefix = ''
      break
    }
  }
  start = preEndingCharIdx + 1
  let end = start + maxEgLength
  let surfix = '...'
  let nextEndingCharIdx = end - 1
  for (let i = wordEnd; i < end; i++) {
    if (isEndingChar(p, i)) {
      nextEndingCharIdx = i
      surfix = ''
      break
    }
  }
  end = nextEndingCharIdx + 1
  const eg = trim(p.slice(start, end))
  return `${prefix}${eg}${surfix}`
}
export default function CaptureDict (props:{offset:number}) {
  const [word, setWord] = useState('')
  const [eg, setEg] = useState('')
  const [mousePos, setMousePos] = useState<FloatDictPosition>()
  useEffect(() => {
    const handleSelected = async () => {
      const section = window.getSelection()
      let w = section?.toString() || ''
      if (!w) {
        setWord('')
        setEg('')
        return
      }
      const node = section?.anchorNode!
      let text = node.textContent!
      let start = section!.anchorOffset!
      const p = getNodeParent(node)
      if (p) {
        const offset = textOffsetOfParent(node, p)
        if (~offset) {
          text = p.textContent!
          start += offset
        }
      }
      const eg = getEg(text, start, start + w.length)
      w = w.trim()
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
  return <DictView word={word} eg={eg} position={mousePos}></DictView>
}
