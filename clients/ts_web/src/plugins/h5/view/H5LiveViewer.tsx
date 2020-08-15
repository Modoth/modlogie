import React, { useState } from 'react'
import { AdditionalSectionsViewerProps } from '../../sections-base/view/SectionViewerProps';
import { ArticleSection } from '../../../domain/Article';
import { SectionNames } from './SectionNames';
import './H5LiveViewer.less'


const getDataUrl = (content: string) => {
    return "data:text/html;charset=utf-8," + encodeURIComponent(content);
}

const combineContent = (sections: Map<string, ArticleSection>): [string | undefined, string | undefined] => {
    var html = sections.get(SectionNames.html)?.content || ''
    var style = sections.get(SectionNames.css)?.content
    var script = sections.get(SectionNames.js)?.content
    if (!html) {
        return [undefined, undefined]
    }

    var content = html;
    var jsContent = ''
    if (style) {
        content += `\n<style>\n${style}\n</style>`
    }

    if (script) {
        jsContent = `${content}\n<script>\n${script}\n</script>`
    }

    return [getDataUrl(content), jsContent ? getDataUrl(jsContent) : undefined]
}

export default function H5LiveViewer(props: AdditionalSectionsViewerProps) {
    const [contentUrl, jsContentUrl] = combineContent(new Map(props.sections.map(s => [s.name!, s])))
    const [running, setRunning] = useState(false)
    const [canRunning] = useState(!!jsContentUrl)
    if (running) {
        return jsContentUrl ?
            <iframe src={jsContentUrl} sandbox="allow-scripts" ></iframe>
            : <></>
    }
    return contentUrl ?
        <div className="h5-live-viewer">
            <iframe src={contentUrl} sandbox=""></iframe>
            <div onClick={() => {
                if (canRunning) {
                    setRunning(true)
                }
            }} className="mask"></div>
        </div>
        : <></>
}