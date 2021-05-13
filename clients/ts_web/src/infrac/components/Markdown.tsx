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
  let front = props.children.filter((c: any) => c.type !== emphasis)
  let back = props.children.filter((c: any) => c.type === emphasis)
  if (back.length) {
    return <span className="mdg">
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
