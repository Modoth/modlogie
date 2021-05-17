import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import renderers from './renderers'
import Markdown from '../../../infrac/components/Markdown'

const AnkiGenerator = (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  return ReactDOMServer.renderToStaticMarkup(<article>
    {
      sections.map((s, i) => <section key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'additional' : 'normal')}>
        {i ? <h3 className="section-title">{s.name}</h3> : undefined }
        <section className="section-content"><Markdown renderers={renderers} source={s.content}></Markdown></section>
      </section>)
    }
  </article>)
}

export default AnkiGenerator
