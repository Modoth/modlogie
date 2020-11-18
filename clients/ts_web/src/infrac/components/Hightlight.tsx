import './Hightlight.less'
import { coy } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Prism } from 'react-syntax-highlighter'
// import { Slider } from 'antd'
import React, { useState } from 'react'

export default function Highlight (props: {
    value: string,
    language: string
}) {
  const [store] = useState({ fontSize: 1 })
  const { language, value } = props
  const ref = React.createRef<HTMLDivElement>()
  return (
    <div className="hightlight" ref={ref} style={{ fontSize: `${store.fontSize}em` }}>
      {/* <Slider vertical={true} tooltipVisible={false} className="font-selector" onChange={value => {
        store.fontSize = typeof (value) === 'number' ? value : value[0]
        if (ref.current) {
          ref.current.style.fontSize = `${store.fontSize}em`
        }
      }} defaultValue={store.fontSize} min={0.6} max={1} step={0.1} /> */}
      <Prism wrapLines={true} language={language} style={coy}>
        {value || ''}
      </Prism>
    </div>

  )
}
