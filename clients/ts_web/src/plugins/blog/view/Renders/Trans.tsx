import './Trans.less'
import React from 'react'

// eslint-disable-next-line react/display-name
const Trans = (props: any) => {
  const front = props.children.filter((c: any) => c.type !== Trans)
  const back = props.children.filter((c: any) => c.type === Trans)
  if (back.length) {
    return <span className="mdg">
      <span className="mdg-f" >{ front }</span>
      <span className="mdg-b">{ back }</span>
    </span>
  } else {
    return <>{front}</>
  }
}

export default Trans
