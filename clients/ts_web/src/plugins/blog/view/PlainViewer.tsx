import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import { ArticleFile } from '../../../domain/ServiceInterfaces/Article'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactMarkdown from 'react-markdown'

// eslint-disable-next-line import/no-webpack-loader-syntax
import Style from '!!raw-loader!./PlainViewer.css'

const renderers = (_:Map<string, ArticleFile>) => {
  return {
    // eslint-disable-next-line react/display-name
    image: (props:{alt:string, src:string}) => {
      const placeHolder = '${FILENAME=' + props.src + '}'
      return <img alt={props.alt} src={placeHolder}></img>
    },
    // eslint-disable-next-line react/display-name
    link: (props:{href:string, children:JSX.Element[]}) => {
      console.log(props)
      return <>{props.children}</>
    }
  } as any
}
export default function PlainViewer (props:ArticleContentViewerProps) {
  const sections = (props.content.sections || []).filter(s => s.content)
  const files = new Map((props.files || []).map(f => [f.url!, f]))
  return ReactDOMServer.renderToStaticMarkup(<div>
    <style>{Style}</style>
    {
      sections.map(s => <div key={s.name!}>
        <h3 >{s.name}</h3>
        <ReactMarkdown renderers={renderers(files)} source={s.content} skipHtml={true}></ReactMarkdown>
      </div>)
    }
  </div>)
}
