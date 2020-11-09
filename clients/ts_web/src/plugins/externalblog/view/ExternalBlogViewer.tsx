import './ExternalBlogViewer.less'
import { AdditionalSectionViewerProps } from '../../../pluginbase/base/view/SectionViewerProps'
import { ConfigKeys } from './Configs'
import { SectionNames } from './Sections'
import { Spin } from 'antd'
import classNames from 'classnames'
import Markdown from '../../../infrac/components/Markdown'
import React, { useEffect, useState } from 'react'

const getRenders = (relativePath:string) => {
  try {
    const url = new URL(relativePath)
    const idx = url.pathname.lastIndexOf('/')
    const path = ~idx ? url.pathname.slice(0, idx) : url.pathname
    const baseUrl = `${url.protocol}//${url.host}${path}`
    return ({
      // eslint-disable-next-line react/display-name
      image: (props: { alt: string, src: string }) => {
        const src = (props.src && !props.src.match(/^https?:\/\//i)) ? `${baseUrl}/${props.src}` : props.src
        return <img alt={props.alt} src={src}></img>
      }
    })
  } catch (e) {
    console.log(e)
  }
}

function UrlMarkdown (props:{url:string, className?:string}) {
  const [content, setContent] = useState('')
  const [renders] = useState(getRenders(props.url))
  const [loading, setLoading] = useState(false)
  if (!renders) {
    return <></>
  }
  const fetchContent = async () => {
    try {
      setLoading(true)
      const res = await fetch(props.url, { cache: 'no-cache', mode: 'cors' })
      const content = await res.text()
      setContent(content)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    fetchContent()
  }, [])
  if (loading) {
    return <Spin spinning={loading} delay={250} indicator={<div className="loading-panel ">
      <div className="loading-small"></div>
    </div>} />
  }
  if (!content) {
    return <></>
  }
  return <Markdown renderers={renders} className={classNames(props.className, 'url-markdown')} source={content} linkTarget="_blank"></Markdown>
}

export default function ExternalBlogViewer (props: AdditionalSectionViewerProps) {
  const msections = new Map(props.sections.map(s => [s.name!, s]))
  const relativePath = msections.get(SectionNames.path)?.content
  const path = props.type.additionalConfigs?.has(ConfigKeys.BASE_ADD) ? `${props.type.additionalConfigs?.get(ConfigKeys.BASE_ADD)}${relativePath}` : relativePath
  const summary = msections.get(SectionNames.summary)?.content

  if (props.summaryMode) {
    return summary
      ? <Markdown source={summary} linkTarget="_blank"></Markdown>
      : <></>
  }

  if (!path) {
    return <></>
  }
  return <UrlMarkdown className="external-blog-viewer" url={path} ></UrlMarkdown>
}
