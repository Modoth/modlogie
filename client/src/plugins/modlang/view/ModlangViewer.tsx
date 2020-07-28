import React from 'react'
import { ArticleContentViewerProps } from '../../IPluginInfo';
import Highlight from './Hightlight';
const ReactMarkdown = require('react-markdown')
import './ModlangViewer.less'
import { ArticleContent } from '../../../domain/Article';
import classNames from 'classnames';
import { Tabs } from 'antd';
const { TabPane } = Tabs;

export default function ModlangViewer(props: ArticleContentViewerProps) {
    var existedSections = new Map((props.content?.sections || []).map(s => [s.name!, s]))
    var sections = props.type!.allSections.size > 0 ? Array.from(
        props.type!.allSections, name => existedSections.get(name)!).filter(s => s && s.content)
        : Array.from(existedSections.values())

    return props.print ? <div className={classNames('modlang-viewer', "only-print")}>
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
        <Tabs className={classNames('modlang-viewer', "no-print")}>{
            sections.map(section => <TabPane className={classNames(section.name, "code")} tab={section.name} key={section.name}>
                <div onClick={props.onClick}>
                    <ReactMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} renderers={{ code: Highlight }}></ReactMarkdown>
                </div>
            </TabPane>)
        }
        </Tabs>
}