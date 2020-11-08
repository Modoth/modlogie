import React from 'react'

export interface LocatableViewCallbacks {
    focus?(): void
    onfocus?(): void
}

export function Div (props: any) {
  return <div {...props}></div>
}

export default function LocatableView<TProp> (props: TProp & { callbacks?: LocatableViewCallbacks, View: { (props: TProp): JSX.Element } }) {
  const ref = React.createRef<HTMLSpanElement>()
  if (props.callbacks) {
    props.callbacks.focus = () => {
      if (ref.current) {
        const offset = 0
        const bodyPos = document.body.getBoundingClientRect().top
        const elementPos = ref.current.nextElementSibling!.getBoundingClientRect().top
        const offsetPosition = elementPos - bodyPos - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    }
    return <>
      <span style={{ display: 'none' }} ref={ref}>{(props as any).className}</span>
      <props.View {...props}></props.View>
    </>
  }
  return <props.View {...props}></props.View>
}
