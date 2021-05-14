import Highlight from '../../../infrac/components/Hightlight'
import React from 'react'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'

// eslint-disable-next-line react/display-name
const emphasis = (props:any) => {
  return <>{props.children.filter((c:any) => c.type !== emphasis)}</>
}

const renderers = {
  // eslint-disable-next-line react/display-name
  image: (props:{alt:string, src:string}) => {
    const placeHolder = '${FILENAME=' + props.src + '}'
    return <img alt={props.alt} src={placeHolder}></img>
  },
  // eslint-disable-next-line react/display-name
  link: (props:{href:string, children:JSX.Element[]}) => {
    switch(props.href){
      default:
        return <>{props.children}</>
    }
  },
  // eslint-disable-next-line react/display-name
  strong: (props: any) => {
    return <>{props.children}</>
  },
  emphasis,
  // eslint-disable-next-line react/display-name
  code: (props: { language: string, value: string}) => {
    if (props.language && ~props.language.indexOf(Seperators.Fields)) {
      return <></>
    }
    return <Highlight language={props.language} value={props.value}></Highlight>
  }
} as any

export default renderers
