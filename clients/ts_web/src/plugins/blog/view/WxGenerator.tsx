import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import renderers from './renderers'

const WxGenerator = (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  const files = new Map((props.files || []).map(f => [f.url!, f]))
  return ReactDOMServer.renderToStaticMarkup(<article className="weui-article">
    {
      sections.map((s, i) => <section key={s.name!} >
        {i ? <h2 className="title">{s.name}</h2> : undefined}
        <section ><ReactMarkdown renderers={renderers(files)} source={s.content} skipHtml={true}></ReactMarkdown></section>
      </section>)
    }
  </article>)
}

export default WxGenerator
