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

export default function Markdown (props:ReactMarkdown.ReactMarkdownProps) {
  return <ReactMarkdown transformLinkUri={transformLinkUri} {...props} skipHtml={true}></ReactMarkdown>
}
