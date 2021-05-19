import './ModlangInterpreter.less'
import { Button } from 'antd'
import { CaretRightOutlined, FullscreenOutlined, FullscreenExitOutlined, MinusOutlined, LoadingOutlined } from '@ant-design/icons'
import { useServicesLocate } from '../../view/common/Contexts'
import ILangInterpretersService, { ILangInterpreter, InterpretRequest } from '../../domain/ServiceInterfaces/ILangInterpretersService'
import React, { useEffect, useState } from 'react'
import IEditorsService, { EditorInfo } from '../../app/Interfaces/IEditorsService'
import ExternalViewer from '../../view/pages/ExternalViewer'
import BufferFile from '../../infrac/Lang/BufferFile'
import IFile from '../../infrac/Lang/IFile'
import classNames from 'classnames'

export function ModlangInterpreter (props: { code: string, lang: string, version?: string, template?: string }) {
  const [request] = useState(() => new InterpretRequest(props.code, props.lang, props.version, props.template))
  const [output, setOutput] = useState<string | undefined>()
  const [compilerOutput, setCompilerOutput] = useState<string | undefined>()
  const [running, setRunning] = useState(false)
  const [opened, setOpened] = useState(false)
  const interpretersService = useServicesLocate()(ILangInterpretersService)
  const [interpreter, setInterpreter] = useState<ILangInterpreter | undefined>()
  const [fullScreen, setFullScreen] = useState(false)
  const [interpreterUrl, setInterpreterUrl] = useState<string | undefined>()
  const [interpreterPlugin] = useState<EditorInfo | undefined>(() => useServicesLocate()(IEditorsService).getInterpreterByFileName(props.lang))
  const [file] = useState<IFile | undefined>(() => interpreterPlugin ? new BufferFile(props.lang, new TextEncoder().encode(JSON.stringify({ ...props, theme: 'dark' }))) : undefined)
  const open = async () => {
    if (running) {
      return
    }
    if (interpreterPlugin) {
      setOpened(true)
      return
    }
    if (!interpreter) {
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
    if (interpreterPlugin) {
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
      opened ? <div onClick={(ev) => ev.stopPropagation()} className={classNames(fullScreen ? 'fullscreen-interpreter' : '', 'result')}>
        <div className="menu">
          <Button size="small" shape="circle" type="text" danger onClick={(ev) => { ev.stopPropagation(); clear() }} className="play" icon={<MinusOutlined />}></Button>
          { interpreterPlugin ? undefined : <Button size="small" shape="circle" type="text" danger onClick={(ev) => { ev.stopPropagation(); setFullScreen(!fullScreen) }} className="play" icon={fullScreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}></Button>
          }          {interpreter && interpreter.info.url && interpreter.info.name ? <a className="title" href={interpreter.info.url}>{interpreter.info.name}</a> : undefined}
        </div>
        {
          interpreterPlugin ? <div className="embed-content"><ExternalViewer file={file!} info={interpreterPlugin} /></div>
            : interpreterUrl
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
