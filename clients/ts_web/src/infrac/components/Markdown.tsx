import React from 'react'
import ReactMarkdown from 'react-markdown'
import "./Markdown.less"

const transformLinkUri = (uri: string) => {
  if (uri) {
    try {
      const u = new URL(uri)
      if (u.protocol.toLowerCase() === 'javascript') {
        return 'javascript:void(0)'
      }
    } catch {
      return ''
    }
  }
  return uri
}

const mask = "__hover_event_mask"
let lastHover : HTMLSpanElement | undefined
const resetHover = (target: any)=>{
  target.classList.remove("hover");
  (target as any)[mask] = undefined
  lastHover = undefined
}
const setHover = (target: any)=>{
  if(lastHover){
    resetHover(lastHover)
  }
  target.classList.add("hover")
  lastHover = target
}

const onEnter = (ev:React.MouseEvent<HTMLSpanElement>) =>{
  const target = ev.currentTarget as HTMLSpanElement
  if((target as any)[mask]){
    return
  }
  setHover(target)
}

const onStart = (ev:React.TouchEvent<HTMLSpanElement>) =>{
  const target = ev.currentTarget as HTMLSpanElement
  (target as any)[mask] = true
  ev.nativeEvent.preventDefault();
  if((ev.target as HTMLSpanElement).nodeName === "A" || ev.nativeEvent?.touches?.[0]?.["touchType"] === "stylus"){
    return
  }
  setHover(target)
}

const onLeave = (ev:React.MouseEvent<HTMLSpanElement>) =>{
  resetHover(ev.currentTarget)
}

// eslint-disable-next-line react/display-name
const emphasis = (props: any) => {
  let front = props.children.filter((c: any) => c.type !== emphasis)
  let back = props.children.filter((c: any) => c.type === emphasis)
  if (back.length) {
    return <span className="mdg" onTouchStart={onStart} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <span className="mdg-f" >{ front }</span>
      <span className="mdg-b">{ back }</span>
    </span>
  } else {
    return <>{front}</>
  }
}

const defaultRenderers = {
  // eslint-disable-next-line react/display-name
  emphasis,
  // eslint-disable-next-line react/display-name
  link: (props: any) => {
    return <a href={decodeURIComponent(props.href)} target={props.target}>{props.children}</a>
  }
}

export default function Markdown(props: ReactMarkdown.ReactMarkdownProps) {
  const renderers = Object.assign({}, defaultRenderers, props.renderers)
  renderers.inlineCode = renderers.code
  return <ReactMarkdown transformLinkUri={transformLinkUri} {...props} renderers={renderers} skipHtml={true}></ReactMarkdown>
}
