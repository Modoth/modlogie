import { useLocatableOffset } from '../../view/common/Contexts'
import React from 'react'

export interface LocatableViewCallbacks {
    locate?(direct?:boolean, offset?: number): void
    onLocated?(): void
}

export function Div (props: any) {
  return <div {...props}></div>
}

export default function LocatableView<TProp> (props: TProp & { callbacks?: LocatableViewCallbacks, View: { (props: TProp): JSX.Element } }) {
  const ref = React.createRef<HTMLSpanElement>()
  const contextOffSet = useLocatableOffset() || 0
  if (props.callbacks) {
    props.callbacks.locate = (direct?:boolean, offset?:number) => {
      if (ref.current) {
        const bodyPos = document.body.getBoundingClientRect().top
        const elementPos = ref.current.nextElementSibling!.getBoundingClientRect().top
        const offsetPosition = elementPos - bodyPos - contextOffSet - (offset || 0)
        window.scrollTo({
          top: offsetPosition,
          behavior: direct ? 'auto' : 'smooth'
        })
      }
    }
    return <>
      <span style={{ display: 'none' }} ref={ref}>{(props as any).className}</span>
      <props.View {...props}></props.View>
    </>
  }
  const p :any = Object.assign({}, props)
  delete p.callbacks
  delete p.View
  return <props.View {...p}></props.View>
}
