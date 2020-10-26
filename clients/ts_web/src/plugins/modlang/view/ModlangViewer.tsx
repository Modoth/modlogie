import React, { useState } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo';
import Highlight from './Hightlight';
const ReactMarkdown = require('react-markdown')
import './ModlangViewer.less'
import { ArticleContent } from '../../../domain/Article';
import classNames from 'classnames';
import { Button, Tabs, Spin } from 'antd';
import { } from 'antd';
import { CaretRightOutlined, MinusOutlined, LoadingOutlined } from '@ant-design/icons'

import { useServicesLocator } from '../../../app/Contexts';
import ILangInterpretersService, { ILangInterpreter, InterpretRequest } from '../../../domain/ILangInterpretersService';
const { TabPane } = Tabs;

export function ModlangInterpreter(props: { code: string, interpreter: ILangInterpreter }) {
    const [output, setOutput] = useState('')
    const [compilerOutput, setCompilerOutput] = useState('')
    const [running, setRunning] = useState(false)
    const [hasResult, setHasResult] = useState(false)
    const interpret = async () => {
        if (running) {
            return
        }
        setRunning(true)
        setHasResult(true)
        var res = await props.interpreter.interpret(new InterpretRequest(props.code))
        setOutput(res.output)
        setCompilerOutput(res.compilerOutpout || '')
        setRunning(false)
    }
    const clear = () => {
        setOutput('')
        setCompilerOutput('')
        setRunning(false)
        setHasResult(false)
    }
    return <>
        <div className="interpreter-menu">
            {hasResult ? undefined :
                <Button size="small" shape="circle" disabled={running} loading={running} type="text" onClick={interpret} className="play" icon={<CaretRightOutlined />}></Button>
            }
        </div>
        {
            hasResult ? <div className="result">
                <div className="menu">
                    <Button size="small" shape="circle" type="text" danger onClick={clear} className="play" icon={<MinusOutlined />}></Button>
                    {props.interpreter.info.url && props.interpreter.info.name ? <a className="title" href={props.interpreter.info.url}>{props.interpreter.info.name}</a> : undefined}
                </div>
                <div className="content">
                    {
                        compilerOutput || output ?
                            <>{compilerOutput ? <div className="compiler-output">{compilerOutput}</div> : undefined}
                                {output ? <div className="output">{output}</div> : undefined}</>
                            :
                            <LoadingOutlined style={{ fontSize: 24 }} />
                    }
                </div>
            </div> : undefined
        }
    </>
}

export default function ModlangViewer(props: ArticleContentViewerProps) {
    var existedSections = new Map((props.content?.sections || []).map(s => [s.name!, s]))
    var sections = props.type!.allSections.size > 0 ? Array.from(
        props.type!.allSections, name => existedSections.get(name)!).filter(s => s && s.content)
        : Array.from(existedSections.values())
    var interpretersService = useServicesLocator().locate(ILangInterpretersService)
    return props.print ? <div className={classNames(props.className, 'modlang-viewer', "only-print")}>
        <>
            {props.showTitle ? <h4 className="article-title">{props.title}</h4> : null}
            {
                sections.map(section => <div className={classNames(section.name, "code")} key={section.name}>
                    <h5>{section.name} </h5>
                    <ReactMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></ReactMarkdown>
                </div>)
            }
        </>
    </div> :
        sections.length > 1 ? <Tabs className={classNames(props.className, 'modlang-viewer', "no-print")}>{
            sections.map(section => {
                var interpreter = section.name && interpretersService.get(section.name)
                return <TabPane className={classNames(section.name, "code")} tab={section.name} key={section.name}>
                    <div onClick={props.onClick}>
                        <ReactMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></ReactMarkdown>
                        {interpreter ? <ModlangInterpreter code={section.content} interpreter={interpreter}></ModlangInterpreter> : undefined}
                    </div>
                </TabPane>
            })
        }
        </Tabs> :
            sections.map(section => {
                var interpreter = section.name && interpretersService.get(section.name)
                return <div className="modlang-viewer"><div className={classNames(section.name, "code")} key={section.name}>
                    <div onClick={props.onClick}>
                        <ReactMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></ReactMarkdown>
                        {interpreter ? <ModlangInterpreter code={section.content} interpreter={interpreter}></ModlangInterpreter> : undefined}
                    </div>
                </div></div>
            })
}