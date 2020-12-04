import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import renderers from './renderers'

// eslint-disable-next-line import/no-webpack-loader-syntax
import PlainStyle from '!!raw-loader!./PlainStyle.css'

const PlainGenerator = (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  return ReactDOMServer.renderToStaticMarkup(<div>
    {PlainStyle ? <div>{PlainStyle}</div> : undefined}
    {
      sections.map((s, i) => <div key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'addition' : 'normal')}>
        {i ? <h3 className="section-title">{s.name}</h3> : undefined }
        <div className="section-content"><ReactMarkdown renderers={renderers} source={s.content} skipHtml={true}></ReactMarkdown></div>
      </div>)
    }
  </div>)
}

export default PlainGenerator
