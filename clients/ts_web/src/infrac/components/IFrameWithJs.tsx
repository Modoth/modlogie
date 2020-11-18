import { v4 } from 'uuid'
import React, { useEffect, useState } from 'react'
import FullscreenWraper, { FullscreenWraperCallbacks } from './FullscreenWraper'

export type IFrameContext = {
    token: string,
    taskTypes: {
        hostMessage: string,
        heartBeat: string,
    }
    apiInfos:ExcuteApiInfos
}

export interface MethodInfo{
  name:string,
  handler:Function
}

export interface ApiInfo{
  name:string,
  methods:MethodInfo[]
}

export const FullScreenApiInfo:ApiInfo = {
  name: '$fullscreen',
  methods: [
    {
      name: 'toogle',
      handler: () => {}
    }
  ]
}

interface ExcuteMethodInfo extends MethodInfo{
  argsStr:string,
  token: string
}

interface ExcuteApiInfo{
  name:string,
  methods:ExcuteMethodInfo[]
}

interface ExcuteApiInfos{
  apis:ExcuteApiInfo[]
  handlers:{[token: string]: Function;}
}

function IFrame (props:any) {
  return <iframe {...props} sandbox="allow-scripts"></iframe>
}

export const generateContext = (apiInfos:ApiInfo[], ns:string): [IFrameContext, string] => {
  const taskTypes = {
    hostMessage: v4(),
    heartBeat: v4()
  }
  const handlers = {} as {[token: string]: Function;}
  const apis = apiInfos.map(i => Object.assign({}, i, {
    methods: i.methods.map(m => {
      const token = v4()
      handlers[token] = m.handler
      return Object.assign({}, m, { token, argsStr: Array.from({ length: m.handler.length }, (_, i) => `x${i}`).join(', ') }) as ExcuteMethodInfo
    }
    )
  }) as ExcuteApiInfo)
  const token = Math.random().toString().slice(2, 34)
  const context = {
    taskTypes,
    token,
    apiInfos: {
      apis,
      handlers
    }
  }
  const jsContent = `(async (window)=>{
        const tasks = {}
        window.addEventListener('message', (e)=>{
          const {data} = e
          if(!data || data.token !== "${token}"){
            return
          }
          e.stopPropagation()
          if(data.taskId === "${taskTypes.hostMessage}"){
            if(window.app && window.app[data.taskResult] && window.app[data.taskResult] instanceof Function){
              window.app[data.taskResult]()
            }
            return
          }
          const resolve = data.taskId && tasks[data.taskId]
          if(resolve){
            resolve(data.taskResult)
          }
          if(data.taskId){
            tasks[data.taskId] = null
          }
        })
        const postMessageAsync = (type, data) => new Promise((resolve, reject)=>{
          const taskId = Math.random().toString().slice(2, 34);
          if(tasks[taskId]){
            reject('Busy')
            return
          }
          window.parent.postMessage({
            token: '${token}',
            taskId: taskId,
            taskType: type,
            taskData:data
          }, '${window.location.origin}')
          tasks[taskId] = resolve
        })${apis.map(i => `
        window.${i.name} = {${i.methods.map(m => `
          ${m.name}: (${m.argsStr}) => postMessageAsync("${m.token}", [${m.argsStr}])`).join(', ')}
        }`).join('')}
        await postMessageAsync("${taskTypes.heartBeat}")
      })(window)`
  return [context, jsContent]
}

type IFrameWithJsProps = { src: string, context?: IFrameContext, allowFullscreen?:boolean }

const createCallbacks = (props:IFrameWithJsProps):FullscreenWraperCallbacks|undefined => {
  if (props.context?.apiInfos?.apis) {
    const fullscreenApi = props.context.apiInfos.apis.find(a => a.name === FullScreenApiInfo.name)
    if (fullscreenApi) {
      const callbacks:FullscreenWraperCallbacks = {}
      const handlers = props.context.apiInfos.handlers
      handlers[fullscreenApi.methods[0].token] = () => {
        if (callbacks.toogle) {
          callbacks.toogle()
        }
      }
      return callbacks
    }
  }
}

export default function IFrameWithJs (props: IFrameWithJsProps) {
  const [callbacks] = useState(createCallbacks(props))
  useEffect(() => {
    if (!props.context) {
      return
    }
    const { token, taskTypes } = props.context

    let lastHeartBeatTime = Date.now()
    let clientWindow: Window
    const listener = async (ev: MessageEvent) => {
      if (!ev.data || ev.data.token !== token) {
        return
      }
      ev.stopPropagation()
      const w = ev.source as Window
      const reply = (result: string | null | undefined | { file: File, data?: any }) =>
        w.postMessage(
          {
            token,
            taskId: ev.data.taskId,
            taskResult: result
          },
          '*'
        )
      if (ev.data.taskType === taskTypes.heartBeat) {
        lastHeartBeatTime = Date.now()
        clientWindow = w
        reply(null)
        return
      }
      const handler = props.context?.apiInfos.handlers[ev.data.taskType]
      if (handler) {
        reply(await handler(...ev.data.taskData))
      } else {
        reply(null)
      }
    }
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  }, [])
  return <FullscreenWraper callbacks={callbacks} enabled={props.allowFullscreen && !callbacks} View={IFrame} src={props.src} ></FullscreenWraper>
}
