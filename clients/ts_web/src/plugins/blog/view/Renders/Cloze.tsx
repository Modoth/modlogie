import './Cloze.less'
import { getSimpleStringHash } from '../../../../view/pages/common'
import { getText } from './common'
import { useMagicMask, useMagicSeed } from '../../../../view/common/Contexts'
import React from 'react'

const getSimpleHash = (children:any, seed:number) => {
  const s : string = getText(children)
  return getSimpleStringHash(s, seed)
}

const Cloze = (props: any) => {
  const magicMask = useMagicMask()
  const magicSeed = useMagicSeed()
  const maxLevel = 2
  if (magicMask === maxLevel || (magicMask >= 1 && (getSimpleHash(props.children, magicSeed) + magicSeed) % maxLevel < magicMask)) {
    return <span className="cloze">{props.children}</span>
  }
  return <>{props.children}</>
}

export default Cloze
