import './MarkdownViewer.less'
import { ArticlePreview } from '../../../view/pages/ArticlePreview'
import { EditOutlined } from '@ant-design/icons'
import { filename } from '../../../infrac/Lang/pathutils'
import { previewArticleByPath } from '../../../view/pages/ServiceView'
import { useServicesLocator, useUser } from '../../../view/common/Contexts'
import classNames from 'classnames'
import Highlight from '../../../infrac/components/Hightlight'
import IServicesLocator from '../../../infrac/ServiceLocator/IServicesLocator'
import Markdown from '../../../infrac/components/Markdown'
import React from 'react'
import SectionViewerProps from '../../../pluginbase/base/view/SectionViewerProps'

const proto = 'article:'
const getRenders = (locator: IServicesLocator) => {
  const user = useUser()
  return ({
    // eslint-disable-next-line react/display-name
    code: (props: { language: string, value: string }) => {
      if (props.language && props.language.startsWith(proto)) {
        let path = props.language.slice(proto.length).trim()
        const idx = path.indexOf(':')
        let type = ''
        if (~idx) {
          type = path.slice(0, idx)
          path = path.slice(idx + 1)
        }
        if (!path) {
          return undefined
        }
        const dataSections = props.value ? [{
          name: 'data',
          content: props.value,
          type
        }] : []
        return <div className="ref-article">{user.editingPermission ? <EditOutlined className="jump-to" onClick={previewArticleByPath(locator, path, filename(path))} /> : undefined}
          <ArticlePreview dataSections={dataSections} path={path}></ArticlePreview>
        </div>
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
    <Markdown renderers={renderers} source={props.section?.content} linkTarget="_blank"></Markdown>
  </div>
}
