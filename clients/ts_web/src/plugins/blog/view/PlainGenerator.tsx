import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import renderers from './renderers'

const PlainGenerator = (style?:string) => (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  const files = new Map((props.files || []).map(f => [f.url!, f]))
  return ReactDOMServer.renderToStaticMarkup(<div>
    {style ? <style>{style}</style> : undefined}
    {
      sections.map((s, i) => <div key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'addition' : 'normal')}>
        {i ? <h2 className="section-title">{s.name}</h2> : undefined }
        <div className="section-content"><ReactMarkdown renderers={renderers} source={s.content} skipHtml={true}></ReactMarkdown></div>
      </div>)
    }
  </div>)
}

export default PlainGenerator
