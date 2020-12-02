import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import classNames from 'classnames'
import Highlight from '../../../infrac/components/Hightlight'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'

const renderers = (_:Map<string, ArticleFile>) => {
  return {
    // eslint-disable-next-line react/display-name
    image: (props:{alt:string, src:string}) => {
      const placeHolder = '${FILENAME=' + props.src + '}'
      return <img alt={props.alt} src={placeHolder}></img>
    },
    // eslint-disable-next-line react/display-name
    link: (props:{href:string, children:JSX.Element[]}) => {
      return <>{props.children}</>
    },
    // eslint-disable-next-line react/display-name
    code: (props: { language: string, value: string}) => {
      if (props.language && ~props.language.indexOf(Seperators.Fields)) {
        return <></>
      }
      return <Highlight language={props.language} value={props.value}></Highlight>
    }
  } as any
}
const PlainViewer = (style:string) => (props:ArticleContentViewerProps) => {
  const sections = (props.content.sections || []).filter(s => s.content)
  const files = new Map((props.files || []).map(f => [f.url!, f]))
  return ReactDOMServer.renderToStaticMarkup(<div>
    <style>{style}</style>
    {
      sections.map((s, i) => <div key={s.name!} className={classNames(s.name, `section-${i}`, props.type?.additionalSections?.has(s.name!) ? 'addition' : 'normal')}>
        <h3 className="section-title">{s.name}</h3>
        <div className="section-content"><ReactMarkdown renderers={renderers(files)} source={s.content} skipHtml={true}></ReactMarkdown></div>
      </div>)
    }
  </div>)
}

export default PlainViewer
