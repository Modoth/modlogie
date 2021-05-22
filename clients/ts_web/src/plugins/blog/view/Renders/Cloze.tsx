import './Cloze.less'
import { getSimpleStringHash } from '../../../../view/pages/common'
import { getText } from './common'
import { useDisableClozeHover, useMagicMask, useMagicSeed } from '../../../../view/common/Contexts'
import React from 'react'
import classNames from 'classnames'

const getSimpleHash = (children:any, seed:number) => {
  const s : string = getText(children)
  return getSimpleStringHash(s, seed)
}

const Cloze = (props: any) => {
  const magicMask = useMagicMask()
  const magicSeed = useMagicSeed()
  const disableClozeHover = useDisableClozeHover()
  const maxLevel = 2
  if (magicMask === maxLevel || (magicMask >= 1 && (getSimpleHash(props.children, magicSeed) + magicSeed) % maxLevel < magicMask)) {
    return <span className={classNames(disableClozeHover ? 'no-hover-cloze' : 'cloze')}>{props.children}</span>
  }
  return <>{props.children}</>
}

export default Cloze
