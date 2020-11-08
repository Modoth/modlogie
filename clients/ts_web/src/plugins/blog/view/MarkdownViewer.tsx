import './MarkdownViewer.less'
import { ArticlePreview } from '../../../view/pages/ArticlePreview'
import { EditOutlined } from '@ant-design/icons'
import { previewArticleByPath } from '../../../view/pages/ServiceView'
import { useServicesLocator, useUser } from '../../../view/common/Contexts'
import classNames from 'classnames'
import Highlight from '../../../infrac/components/Hightlight'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'
import React from 'react'
import ReactMarkdown from 'react-markdown'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'

const getRenders = (locator: IServicesLocator) => {
  const user = useUser()
  return ({
    // eslint-disable-next-line react/display-name
    code: (props: { language: string, value: string }) => {
      if (props.language === 'article') {
        const path = props.value && props.value.trim()
        if (!path) {
          return undefined
        }
        return <div className="ref-article">{user.editingPermission ? <EditOutlined className="jump-to" onClick={previewArticleByPath(locator, path, path.split('/').pop())} /> : undefined}<ArticlePreview path={path}></ArticlePreview></div>
      }
      return <Highlight language={props.language} value={props.value}></Highlight>
    }
  })
}

export default function MarkdownViewer (props: SectionViewerProps) {
  const locator = useServicesLocator()
  const renderers = getRenders(locator) as any
  return <div onClick={(e) => {
    if ((e.target as any)?.nodeName === 'A') {
      return
    }
    if (props.onClick) {
      props.onClick(e)
    }
  }} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode', props.className)} key={props.section.name}>
    <label className="md-name">{props.section.name}</label>
    <ReactMarkdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></ReactMarkdown>
  </div>
}
