import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import renderers from './renderers'

const mdRender = Object.assign({}, renderers, {
  // eslint-disable-next-line react/display-name
  list: (props:{children: any[], depth: number, ordered: boolean, start: number, tight: boolean}) => {
    return <ul>{props.children.map((c) => <li key={c.key}>{c.props.children[0]}</li>)}</ul>
  }
})as any

const WxGenerator = (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  return ReactDOMServer.renderToStaticMarkup(<article className="weui-article">
    {
      sections.map((s, i) => <section key={s.name!} >
        {i ? <h2 className="title">{s.name}</h2> : undefined}
        <section ><ReactMarkdown renderers={mdRender} source={s.content} skipHtml={true}></ReactMarkdown></section>
      </section>)
    }
  </article>)
}

export default WxGenerator
