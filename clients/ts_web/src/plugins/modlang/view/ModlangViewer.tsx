import React, { useState } from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo';
import Highlight from './Hightlight';
const ReactMarkdown = require('react-markdown')
import './ModlangViewer.less'
import { ArticleContent } from '../../../domain/Article';
import classNames from 'classnames';
import { Button, Tabs } from 'antd';
import { CaretRightOutlined, ClearOutlined } from '@ant-design/icons'

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
        var res = await props.interpreter.interpret(new InterpretRequest(props.code))
        setOutput(res.output)
        setCompilerOutput(res.compilerOutpout || '')
        setRunning(false)
        setHasResult(true)
    }
    const clear = () => {
        setOutput('')
        setCompilerOutput('')
        setRunning(false)
        setHasResult(false)
    }
    return <>
        <div className="interpreter-menu">
            {props.interpreter.info.url && props.interpreter.info.name ? <a href={props.interpreter.info.url}>{props.interpreter.info.name}</a> : undefined}
            {hasResult ?
                <Button size="small" shape="circle" type="text" danger onClick={clear} className="play" icon={<ClearOutlined />}></Button> :
                <Button size="small" shape="circle" disabled={running} loading={running} type="text" onClick={interpret} className="play" icon={<CaretRightOutlined />}></Button>

            }
        </div>
        {
            hasResult ? <div className="result">
                {compilerOutput ? <div className="compiler-output">{compilerOutput}</div> : undefined}
                {output ? <div className="output">{output}</div> : undefined}
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
        <Tabs className={classNames(props.className, 'modlang-viewer', "no-print")}>{
            sections.map(section => {
                var interpreter = section.name && interpretersService.get(section.name)
                return <TabPane className={classNames(section.name, "code")} tab={section.name} key={section.name}>
                    <div onClick={props.onClick}>
                        {interpreter ? <ModlangInterpreter code={section.content} interpreter={interpreter}></ModlangInterpreter> : undefined}
                        <ReactMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></ReactMarkdown>
                    </div>
                </TabPane>
            })
        }
        </Tabs>
}