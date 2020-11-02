import React, { useState } from 'react'
import './ResFileViewer.less'
import classNames from 'classnames'
import SectionViewerProps from '../../sections-base/view/SectionViewerProps'
import yaml from 'yaml'
import { ResFile } from '../ResFile'

export class ResFileViewerProps {

}

export default function ResFileViewer(props: SectionViewerProps) {
    const ref = React.createRef<HTMLSpanElement>()
    if (props.callbacks) {
        props.callbacks.focus = () => {
            if (ref.current) {
                var offset = 60;
                const bodyPos = document.body.getBoundingClientRect().top;
                var elementPos = ref.current.getBoundingClientRect().top;
                var offsetPosition = elementPos - bodyPos - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }
    }
    const [resfile] = useState(yaml.parse(props.section.content) as ResFile)
    const [url] = useState(props.filesDict.get(resfile?.name)?.url)
    if (!url) {
        return <></>
    }
    return <div onClick={props.onClick} className={classNames('md-viewer', props.section.name?.match(/(^.*?)(\(|（|$)/)![1], props.pureViewMode ? 'view-mode' : 'edit-mode')} key={props.section.name}>
        <span ref={ref} ></span>
        <div><a download={resfile.name} href={url}>{resfile.name}</a></div>
    </div>
}