import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import renderers from './renderers'

const PlainGenerator = (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  return ReactDOMServer.renderToStaticMarkup(<article>
    {
      sections.map((s, i) => <section key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'additional' : 'normal')}>
        {i ? <h3 className="section-title">{s.name}</h3> : undefined }
        <section className="section-content"><ReactMarkdown renderers={renderers} source={s.content} skipHtml={true}></ReactMarkdown></section>
      </section>)
    }
  </article>)
}

export default PlainGenerator
