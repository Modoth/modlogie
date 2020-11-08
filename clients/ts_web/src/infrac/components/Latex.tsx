import './Latex.less'
import 'katex/dist/katex.min.css'
import classNames from 'classnames'
import katex from 'katex'
import React, { useEffect } from 'react'

export default function Latex (props: { inline?: boolean, content?: string, className?: string; }) {
  const refElement = React.createRef<HTMLDivElement>()
  useEffect(() => {
    const content = props.content
    if (content && refElement.current) {
      katex.render(content, refElement.current, {
        throwOnError: false,
        macros: {
          '\\[': '',
          '\\]': ''
        }
      })
    }
  }, [])
  return <span className={classNames(props.className, props.inline ? 'inline-latex' : 'block-latex')} ref={refElement}>{props.content || ''}</span>
}
