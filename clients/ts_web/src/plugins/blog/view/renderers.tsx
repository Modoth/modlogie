import Highlight from '../../../infrac/components/Hightlight'
import React from 'react'
import Seperators from '../../../domain/ServiceInterfaces/Seperators'

const renderers = {
  // eslint-disable-next-line react/display-name
  image: (props:{alt:string, src:string}) => {
    const placeHolder = '${FILENAME=' + props.src + '}'
    return <img alt={props.alt} src={placeHolder}></img>
  },
  // eslint-disable-next-line react/display-name
  link: (props:{href:string, children:JSX.Element[]}) => {
    switch(props.href){
      case 's:':
        return <></>
      default:
        return <>{props.children}</>
    }
  },
  // eslint-disable-next-line react/display-name
  code: (props: { language: string, value: string}) => {
    if (props.language && ~props.language.indexOf(Seperators.Fields)) {
      return <></>
    }
    return <Highlight language={props.language} value={props.value}></Highlight>
  }
} as any

export default renderers
