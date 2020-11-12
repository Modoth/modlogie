import React from 'react'
import { useServicesLocator } from '../common/Contexts'

export interface SimpleViewerWraperProps{
    name:string,
    type?:string,
    buffer:ArrayBuffer,
}

export interface SimpleEditorWraperProps extends SimpleViewerWraperProps{
    readonly?:boolean;
    onSave?(buffer:ArrayBuffer):void
}

export function SimpleViewerWraper (props:SimpleViewerWraperProps) {
  const locator = useServicesLocator()

  return <></>
}

export function SimpleEditorWraper (props:SimpleEditorWraperProps) {
  const locator = useServicesLocator()
  if (props.readonly) {
    return <SimpleViewerWraper {...props} />
  }
  return <></>
}
