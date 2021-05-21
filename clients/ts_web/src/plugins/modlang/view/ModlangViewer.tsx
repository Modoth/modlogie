import './ModlangViewer.less'
import { ArticleContentViewerProps } from '../../../pluginbase/IPluginInfo'
import { Tabs } from 'antd'
import classNames from 'classnames'
import React from 'react'
import { ModlangInterpreter } from '../../../view/pages/ModlangInterpreter'
import EnhancedMarkdown from '../../../view/pages/EnhancedMarkdown'

const { TabPane } = Tabs

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
          <EnhancedMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} />
        </div>)
      }
    </>
  </div>
    : (sections.length > 1 ? <Tabs className={classNames(props.className, 'ModLang', 'no-print')}>{
      sections.map(section => {
        return <TabPane className={classNames(section.name, 'code')} tab={section.name} key={section.name}>
          <div onClick={props.onClick}>
            <EnhancedMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} />
            {section.name ? <ModlangInterpreter code={section.content} lang={section.name}></ModlangInterpreter> : undefined}
          </div>
        </TabPane>
      })
    }
    </Tabs> : <div className="ModLang">{
      sections.map(section => {
        return <div className={classNames(section.name, 'code')} key={section.name}>
          <div onClick={props.onClick}>
            <EnhancedMarkdown source={'```' + section.name + '\n' + (section.content || '') + '\n```'} />
            {section.name ? <ModlangInterpreter code={section.content} lang={section.name}></ModlangInterpreter> : undefined}
          </div>
        </div>
      })}</div>)
}
