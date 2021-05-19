import { getAnkiGenerator } from './AnkiGenerator'
import React from 'react'

// eslint-disable-next-line react/display-name
const strong = (props: any) => {
  return <><>{'{{c1::'}</><>{props.children}</><>{'}}'}</></>
}

const AnkiClozeGenerator = getAnkiGenerator({ strong })

export default AnkiClozeGenerator
