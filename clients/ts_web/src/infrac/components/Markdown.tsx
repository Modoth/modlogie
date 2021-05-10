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

// eslint-disable-next-line react/display-name
const emphasis = (props: any) => {
  console.log(props)
  let front = props.children.filter((c: any) => c.type !== emphasis)
  let back = props.children.filter((c: any) => c.type === emphasis)
  if (back.length) {
    return <span className="mdg">
      <span className="mdg-f">{ front }</span>
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
    let p = props.href?.split(':')[0]
    switch (p) {
      case 's':
        return <><span className="t"></span><span className={p}>{props.children}</span></>
      // case 'code':
      // case 'wiki':
      //   return <a href={decodeURIComponent(props.href)} target={props.target}><ruby>{props.children}<rp>(</rp><rt>{p}</rt><rp>)</rp></ruby></a>
      default:
        return <a href={decodeURIComponent(props.href)} target={props.target}>{props.children}</a>
    }
  }
}

export default function Markdown(props: ReactMarkdown.ReactMarkdownProps) {
  const renderers = Object.assign({}, defaultRenderers, props.renderers)
  return <ReactMarkdown transformLinkUri={transformLinkUri} {...props} renderers={renderers} skipHtml={true}></ReactMarkdown>
}
