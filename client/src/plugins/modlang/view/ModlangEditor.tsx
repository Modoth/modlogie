import React, { useState } from 'react'
import { ArticleContentEditorProps } from '../../IPluginInfo';
import TextArea from 'antd/lib/input/TextArea';
import { ArticleSection } from '../../../domain/Article';
import classNames from 'classnames';
import './ModlangEditor.less'
import { Tabs } from 'antd';
const { TabPane } = Tabs;

function SectionEditor(props: { section: ArticleSection, callbacks: { getEditedContent?(): string } }) {
    const [content, setContent] = useState(props.section.content || '')
    props.callbacks.getEditedContent = () => {
        return content
    }
    return <TextArea value={content} onChange={
        e => {
            setContent(e.target.value);
        }
    }>
    </TextArea>
}

export default function ModlangEditor(props: ArticleContentEditorProps) {
    var existedSections = new Map((props.content?.sections || []).map(s => [s.name!, s]))
    var sections = Array.from(
        props.type!.allSections, name => existedSections.get(name) || { name } as ArticleSection)
    var callbacks = new Map(sections.map(s => [s, {} as any]))
    props.callbacks.getEditedContent = () => {
        return { sections: Array.from(callbacks, ([{ name, content }, { getEditedContent }]) => ({ name, content: getEditedContent ? getEditedContent() : content })) }
    }
    return (
        <Tabs className={classNames('modlang-editor')}>{
            sections.map(section => <TabPane className={classNames(section.name, "code")} tab={section.name} key={section.name}>
                <div >
                    <SectionEditor callbacks={callbacks.get(section)!} key={section.name} section={section}></SectionEditor>
                </div>
            </TabPane>)
        }
        </Tabs>
    )
}