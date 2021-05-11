import './ModlangViewer.less'
import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import { Button, Tabs } from 'antd'
import { CaretRightOutlined, MinusOutlined, LoadingOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../../../view/common/Contexts'
import classNames from 'classnames'
import Highlight from '../../../infrac/components/Hightlight'
import ILangInterpretersService, { ILangInterpreter, InterpretRequest } from '../../../domain/ServiceInterfaces/ILangInterpretersService'
import React, { useEffect, useState } from 'react'
import IEditorsService, { EditorInfo } from '../../../app/Interfaces/IEditorsService'
import ExternalViewer from '../../../view/pages/ExternalViewer'
import BufferFile from '../../../infrac/Lang/BufferFile'
import IFile from '../../../infrac/Lang/IFile'

const Markdown = require('react-markdown')
const { TabPane } = Tabs

export function ModlangInterpreter (props: { code: string, lang: string, version?: string }) {
  const [request] = useState(()=>new InterpretRequest(props.code, props.lang, props.version))
  const [output, setOutput] = useState<string|undefined>()
  const [compilerOutput, setCompilerOutput] = useState<string|undefined>()
  const [running, setRunning] = useState(false)
  const [opened, setOpened] = useState(false)
  const interpretersService = useServicesLocate()(ILangInterpretersService)
  const [interpreter, setInterpreter] = useState<ILangInterpreter | undefined>()
  const [interpreterUrl, setInterpreterUrl] = useState<string | undefined>()
  const [interpreterPlugin] = useState<EditorInfo|undefined>(()=>useServicesLocate()(IEditorsService).getInterpreterByFileName(props.lang))
  const [file] = useState<IFile|undefined>(()=>interpreterPlugin? new BufferFile(props.lang, new TextEncoder().encode(JSON.stringify({...props, theme: 'dark'}))) :undefined)
  const open = async () => {
    if (running) {
      return
    }
    if(interpreterPlugin){
      setOpened(true)
      return
    }
    if(!interpreter){
      return
    }
    setOpened(true)
    if (!interpreter.interpret) {
      return
    }
    setRunning(true)
    const res = await interpreter.interpret(request)
    setOutput(res.output)
    setCompilerOutput(res.compilerOutpout || '')
    setRunning(false)
  }
  useEffect(() => {
    if(interpreterPlugin){
      return
    }
    (async () => {
      const interpreter = await interpretersService.get(props.lang)
      if (interpreter && interpreter.interpretUrl) {
        const url = interpreter.interpretUrl(request)
        setInterpreterUrl(url)
      }
      setInterpreter(interpreter)
    })()
  }, [])
  const clear = () => {
    setOutput(undefined)
    setCompilerOutput(undefined)
    setRunning(false)
    setOpened(false)
  }
  if ((!interpreter || !(interpreter.interpret || interpreter.interpretUrl)) && !interpreterPlugin) {
    return <></>
  }
  return <>
    <div className="interpreter-menu">
      {opened ? undefined
        : <Button size="small" shape="circle" disabled={running} loading={running} type="text" onClick={(ev) => { ev.stopPropagation(); open() }} className="play" icon={<CaretRightOutlined />}></Button>
      }
    </div>
    {
      opened ? <div className="result">
        <div className="menu">
          <Button size="small" shape="circle" type="text" danger onClick={(ev) => { ev.stopPropagation(); clear() }} className="play" icon={<MinusOutlined />}></Button>
          {interpreter && interpreter.info.url && interpreter.info.name ? <a className="title" href={interpreter.info.url}>{interpreter.info.name}</a> : undefined}
        </div>
        {
          interpreterPlugin ? <div className="embed-content"><ExternalViewer file={file!} info={interpreterPlugin}/></div> :
          interpreterUrl
            ? <div className="embed-content">
              {
                <iframe src={interpreterUrl}></iframe>
              }
            </div>
            : <div className="content">
              {
                compilerOutput !== undefined || output !== undefined
                  ? <>{compilerOutput ? <div className="compiler-output">{compilerOutput}</div> : undefined}
                    {output ? <div className="output">{output}</div> : undefined}</>
                  : <LoadingOutlined style={{ fontSize: 24 }} />
              }
            </div>
        }
      </div> : undefined
    }
  </>
}

export default function ModlangViewer (props: ArticleContentViewerProps) {
  const existedSections = new Map((props.content?.sections || []).map(s => [s.name!, s]))
  const sections = props.type!.allSections.size > 0 ? Array.from(
        props.type!.allSections, name => existedSections.get(name)!).filter(s => s && s.content)
    : Array.from(existedSections.values())
  return props.print ? <div className={classNames(props.className, 'ModLang', 'only-print')}>
    <>
      {props.showTitle ? <h4 className="article-title">{props.title}</h4> : null}
      {
        sections.map(section => <div className={classNames(section.name, 'code')} key={section.name}>
          <h5>{section.name} </h5>
          <Markdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></Markdown>
        </div>)
      }
    </>
  </div>
    : (sections.length > 1 ? <Tabs className={classNames(props.className, 'ModLang', 'no-print')}>{
      sections.map(section => {
        return <TabPane className={classNames(section.name, 'code')} tab={section.name} key={section.name}>
          <div onClick={props.onClick}>
            <Markdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></Markdown>
            {section.name ? <ModlangInterpreter code={section.content} lang={section.name}></ModlangInterpreter> : undefined}
          </div>
        </TabPane>
      })
    }
    </Tabs> : <div className="ModLang">{
      sections.map(section => {
        return <div className={classNames(section.name, 'code')} key={section.name}>
          <div onClick={props.onClick}>
            <Markdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></Markdown>
            {section.name ? <ModlangInterpreter code={section.content} lang={section.name}></ModlangInterpreter> : undefined}
          </div>
        </div>
      })}</div>)
}
