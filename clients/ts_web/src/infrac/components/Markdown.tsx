import React from 'react'
import ReactMarkdown from 'react-markdown'

export default function Markdown (props:ReactMarkdown.ReactMarkdownProps) {
  return <ReactMarkdown {...props} skipHtml={true}></ReactMarkdown>
}
