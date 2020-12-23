import React from 'react'
import ReactMarkdown from 'react-markdown'

const transformLinkUri = (uri:string) => {
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

const defaultRenderers = {
  // eslint-disable-next-line react/display-name
  link: (props:any) => {
    return <a href={decodeURIComponent(props.href)} target={props.target}>{props.children}</a>
  }
}

export default function Markdown (props:ReactMarkdown.ReactMarkdownProps) {
  const renderers = Object.assign({}, defaultRenderers, props.renderers)
  return <ReactMarkdown transformLinkUri={transformLinkUri} {...props} renderers={renderers} skipHtml={true}></ReactMarkdown>
}
