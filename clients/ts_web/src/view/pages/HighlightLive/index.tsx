import './HighlightLive.less'
import { ArticlePreview } from '../ArticlePreview'
import { Branch } from './charts/Branch'
import { EditOutlined } from '@ant-design/icons'
import { filename } from '../../../infrac/Lang/pathutils'
import { previewArticleByPath } from '../ServiceView'
import { Timeline } from './charts/Timeline'
import { toJsObj } from '../../../infrac/Lang/DataUtils'
import { useServicesLocator, useUser } from '../../common/Contexts'
import BufferFile from '../../../infrac/Lang/BufferFile'
import ExternalViewer from '../ExternalViewer'
import Highlight from '../../../infrac/components/Hightlight'
import IEditorsService from '../../../app/Interfaces/IEditorsService'
import React from 'react'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'

export class HighlightLiveViewerProps {
  type: string
  data:object
}
const viewers = new Map<string, {(props: HighlightLiveViewerProps): JSX.Element }>([['branch', Branch], ['timeline', Timeline]])

const proto = `article${Seperators.LangFields}`

const splitFormat = (lang:string, defaultFormat?:string):[string, string|undefined] => {
  const idx = lang.indexOf(Seperators.Fields)
  if (~idx) {
    return [lang.slice(idx + 1)?.trim(), lang.slice(0, idx)?.trim()]
  }
  return [lang, defaultFormat]
}

export default function HighlightLive (props: { language: string, value: string, format?:string }) {
  const user = useUser()
  const locator = useServicesLocator()
  let format = props.format
  let lang = props.language
    ;[lang, format] = splitFormat(lang, format)
  if (lang && lang.startsWith(proto)) {
    const path = lang.slice(proto.length).trim()
    if (!path) {
      return <></>
    }
    const dataSections = props.value ? [{
      name: 'data',
      content: props.value,
      type: format
    }] : []
    return <div className="highlight-live ref-article">
      <ArticlePreview dataSections={dataSections} path={path}></ArticlePreview>
      {user.editingPermission ? <EditOutlined className="jump-to" onClick={previewArticleByPath(locator, path, filename(path))} /> : undefined}
    </div>
  }
  const viewerInfo = locator.locate(IEditorsService).getViewerByFileName(lang)
  if (viewerInfo) {
    return <div className="highlight-live h5-live-viewer"><ExternalViewer info={viewerInfo} file={new BufferFile('', new TextEncoder().encode(props.value).buffer)}></ExternalViewer></div>
  }
  const Viewer = viewers.get(lang)
  if (Viewer) {
    const data = toJsObj(format, props.value)
    if (!data) {
      return <></>
    }
    return <Viewer type={lang} data={data}></Viewer>
  }
  return <Highlight language={lang} value={props.value}></Highlight>
}
