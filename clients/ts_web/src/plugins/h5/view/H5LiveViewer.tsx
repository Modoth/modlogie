import React, { useState } from 'react'
import { AdditionalSectionViewerProps } from '../../base/view/SectionViewerProps';
import { ArticleSection } from '../../../domain/Article';
import { SectionNames } from './Sections';
import './H5LiveViewer.less'
import YAML, { stringify } from 'yaml'
import FrameWorks from './frameworks'
import { Button } from 'antd';
import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons'
import classNames from 'classnames';

const getDataUrl = (content: string) => {
    return "data:text/html;charset=utf-8," + encodeURIComponent(content);
}

const combineContent = (sections: Map<string, ArticleSection>): [string | undefined, string | undefined] => {
    var html = sections.get(SectionNames.html)?.content || ''
    var frameworks = sections.get(SectionNames.frameworks)?.content
    var fws = frameworks && (frameworks.split(' ').filter(s => s && FrameWorks.has(s)).map(s => FrameWorks.get(s)).filter(s => s))
    var fw_htmls = fws && fws.map(f => f && f.html)
    var fw_jss = fws && fws.map(f => f && f.js)
    var jsData = '';
    if (!html && !(fw_htmls && fw_htmls.length)) {
        return [undefined, undefined]
    }
    var style = sections.get(SectionNames.css)?.content
    var script = sections.get(SectionNames.js)?.content
    var data = sections.get(SectionNames.data)?.content

    if (data) {
        try {
            jsData = JSON.stringify(YAML.parse(data))
        }
        catch (e) {
            console.log(e)
        }
    }

    var content = html || '';
    var jsContent = ''
    if (style) {
        content += `\n<style>\n${style}\n</style>`
    }
    if (fw_htmls && fw_htmls.length) {
        content += `\n${fw_htmls.join('\n')}\n`
    }

    if (jsData) {
        jsContent += `<script>\nwindow.appData=${jsData}\n</script>\n`
    }
    if (fw_jss && fw_jss.length) {
        jsContent += `<script>\n${fw_jss.join('\n')}\n</script>`
    }

    if (script) {
        jsContent += `<script>\n${script}\n</script>\n`
    }

    jsContent = `${content}\n${jsContent}`

    return [getDataUrl(content), jsContent ? getDataUrl(jsContent) : undefined]
}

function IFrameWithoutJs(props: { src: string }) {
    return <iframe src={props.src} sandbox=""></iframe>
}

function IFrameWithJs(props: { src: string }) {
    return <iframe src={props.src} sandbox="allow-scripts"></iframe>
}

export default function H5LiveViewer(props: AdditionalSectionViewerProps) {
    const [contentUrl, jsContentUrl] = combineContent(new Map(props.sections.map(s => [s.name!, s])))
    const [running, setRunning] = useState(false)
    const [canRunning] = useState(!!jsContentUrl)
    const [fullscreen, setFullscreen] = useState(false)
    if (!((running && jsContentUrl) || (!running && contentUrl))) {
        return <></>
    }
    return <div className={classNames("h5-live-viewer", fullscreen ? "fullscreen" : "")}>
        {
            running ?
                <IFrameWithJs src={jsContentUrl!} />
                :
                <IFrameWithoutJs src={contentUrl!} />
        }
        {running ? undefined : <div onClick={() => {
            if (canRunning) {
                setRunning(true)
            }
        }} className="mask"></div>}
        <div className="float-menu"><Button size="large" type="link" onClick={() => {
            if (!fullscreen) {
                setRunning(true)
            }
            setFullscreen(!fullscreen)
        }} icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}></Button></div>
    </div>
}