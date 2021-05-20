import HighlightLive from '../HighlightLive'
import Markdown from '../../../infrac/components/Markdown'
import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Wiki from './Wiki'

const transformLinkUri = (uri: string) => {
  if (uri) {
    try {
      const u = new URL(uri)
      if (u.protocol.toLowerCase() === 'javascript') {
        return 'javascript:void(0)'
      }
    } catch {
      return 'javascript:void(0)'
    }
  }
  return uri
}

export default function EnhancedMarkdown (props: ReactMarkdown.ReactMarkdownProps) {
  const [renders] = useState(() => ({ ...props.renderers, link: Wiki, code: HighlightLive }))
  return <Markdown transformLinkUri={transformLinkUri} {...props} renderers={renders} ></Markdown>
}
