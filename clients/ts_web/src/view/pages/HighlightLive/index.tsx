import './HighlightLive.less'
import { ArticlePreview } from '../ArticlePreview'
import { Branch } from './charts/Branch'
import { EditOutlined } from '@ant-design/icons'
import { filename } from '../../../infrac/Lang/pathutils'
import { previewArticleByPath } from '../ServiceView'
import { Timeline } from './charts/Timeline'
import { toJsObj } from '../../../infrac/Lang/DataUtils'
import { useServicesLocate, useUser } from '../../common/Contexts'
import BufferFile from '../../../infrac/Lang/BufferFile'
import ExternalViewer from '../ExternalViewer'
import Highlight from '../../../infrac/components/Hightlight'
import IEditorsService from '../../../app/Interfaces/IEditorsService'
import React from 'react'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'
import { ModlangInterpreter } from '../ModlangInterpreter'

export class HighlightLiveViewerProps {
  type: string
  data:object
}
const viewers = new Map<string, {(props: HighlightLiveViewerProps): JSX.Element }>([['branch', Branch], ['timeline', Timeline]])
const getHighlightFormat = (lang:string, defaultFormat?:string):[ string|undefined, string] => {
  const idx = lang.indexOf(Seperators.Fields)
  if (~idx) {
    return [lang.slice(0, idx)?.trim(), lang.slice(idx + 1)?.trim()]
  }
  return [defaultFormat, lang]
}

export default function HighlightLive (props: { inline?:boolean, language: string, value: string, format?:string }) {
  const user = useUser()
  const locate = useServicesLocate()
  let dataFormatOrcodeTemplate = props.format
  let lang = (props.inline ? props.value : props.language) || ''
    ;[dataFormatOrcodeTemplate, lang] = getHighlightFormat(lang, dataFormatOrcodeTemplate)
  const protoSeperator = `${Seperators.LangFields}`
  const protoIdx = lang.match(/^\s*w/) ? lang.indexOf(protoSeperator) : -1
  if (lang && ~protoIdx) {
    let pathOrName = lang.slice(protoIdx + protoSeperator.length).trim()
    if (!pathOrName) {
      return <></>
    }
    let proto:string|undefined = lang.slice(0, protoIdx).trim()
    if (!proto || proto === 'article') {
      proto = undefined
    }
    if (!proto && pathOrName[0] !== '/') {
      pathOrName = '/' + pathOrName
    }
    const dataSections = !props.inline && props.value ? [{
      name: 'data',
      content: props.value,
      type: dataFormatOrcodeTemplate
    }] : []
    return <div className="highlight-live ref-article">
      <ArticlePreview dataSections={dataSections} root={proto} pathOrName={pathOrName}></ArticlePreview>
      {user.editingPermission ? <EditOutlined className="jump-to" onClick={previewArticleByPath(locate, pathOrName, filename(pathOrName), proto)} /> : undefined}
    </div>
  }
  if (props.inline) {
    return <code>{props.value}</code>
  }
  const viewerInfo = locate(IEditorsService).getViewerByFileName(lang)
  if (viewerInfo) {
    return <div className="highlight-live h5-live-viewer"><ExternalViewer info={viewerInfo} file={new BufferFile('', new TextEncoder().encode(props.value).buffer)}></ExternalViewer></div>
  }
  const Viewer = viewers.get(lang)
  if (Viewer) {
    const data = toJsObj(dataFormatOrcodeTemplate, props.value)
    if (!data) {
      return <></>
    }
    return <Viewer type={lang} data={data}></Viewer>
  }
  return <>
    <Highlight language={lang} value={props.value}></Highlight>
    {dataFormatOrcodeTemplate && lang ? <ModlangInterpreter template={dataFormatOrcodeTemplate} code={props.value} lang={lang}></ModlangInterpreter> : undefined}
  </>
}
