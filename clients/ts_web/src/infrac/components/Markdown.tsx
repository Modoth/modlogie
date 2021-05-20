import './Markdown.less'
import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function Markdown (props: ReactMarkdown.ReactMarkdownProps) {
  const renderers = Object.assign({}, props.renderers)
  renderers.inlineCode = renderers.inlineCode || renderers.code
  return <ReactMarkdown {...props} renderers={renderers} skipHtml={true}></ReactMarkdown>
}
