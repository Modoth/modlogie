import './PublishArticle.less'
import { ArticleContentViewerProps } from '../../pluginbase/IPluginInfo'
import { srcToUrl } from '../../infrac/Lang/srcToUrl'
import React from 'react'

export default function PublishArticle (props:{
     Generator:((props: ArticleContentViewerProps) => string)} & ArticleContentViewerProps) {
  const markup = props.Generator(props)
  const files = new Map((props.files || []).map(f => [f.name!, f.url]))
  const fixedMarkup = markup.replaceAll(/\$\{FILENAME=(.*?)\}/g, (_, name) => {
    const u = files.has(name)
      ? `${window.location.protocol}//${window.location.host}/${files.get(name)}`
      : ''
    return u
  })
  console.log(markup)
  const url = srcToUrl(fixedMarkup)
  return <div className="publish-article"><div className="iframe-wraper"><iframe src={url} sandbox=""></iframe></div></div>
}
