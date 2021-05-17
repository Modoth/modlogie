import { ArticleContentExporterProps } from '../../../pluginbase/IPluginInfo'
import classNames from 'classnames'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import renderers from './renderers'
import Markdown from '../../../infrac/components/Markdown'

const getImageRenderer = (resources: any[]) => (props:{alt:string, src:string}) => {
  resources.push({name: props.alt, path: props.src})
  return <img alt={props.alt} src={props.alt}></img>
}

const AnkiGenerator = (props: ArticleContentExporterProps) => {
  const sections = props.content.sections?.[0] ? [props.content.sections?.[0]] : []
  const image = getImageRenderer(props.resources)
  return ReactDOMServer.renderToStaticMarkup(<article>
    {
      sections.map((s, i) => <section key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'additional' : 'normal')}>
        {i ? <h3 className="section-title">{s.name}</h3> : undefined }
        <section className="section-content"><Markdown renderers={{...renderers, image}} source={s.content}></Markdown></section>
      </section>)
    }
  </article>)
}

export default AnkiGenerator
