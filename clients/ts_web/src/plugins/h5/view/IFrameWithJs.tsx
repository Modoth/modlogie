
import React, { useEffect } from 'react'
import { useServicesLocator } from '../../../view/Contexts';
import IViewService from '../../../app/Interfaces/IViewService';
import ILangsService, { LangKeys } from '../../../domain/ServiceInterfaces/ILangsService';

export type IFrameContext = {
    token: string,
    taskTypes: {
        hostMessage: string,
        heartBeat: string,
        sessionStorage_getItem: string,
        sessionStorage_setItem: string,
        localStorage_getItem: string,
        localStorage_openFile: string,
        localStorage_setItem: string,
    }
}

export const generateContext = (): [IFrameContext, string] => {
    const taskTypes = {
        hostMessage: Math.random().toString().slice(2, 34),
        heartBeat: Math.random().toString().slice(2, 34),
        sessionStorage_getItem: Math.random().toString().slice(2, 34),
        sessionStorage_setItem: Math.random().toString().slice(2, 34),
        localStorage_getItem: Math.random().toString().slice(2, 34),
        localStorage_openFile: Math.random().toString().slice(2, 34),
        localStorage_setItem: Math.random().toString().slice(2, 34),
    }
    const token = Math.random().toString().slice(2, 34)
    const context = {
        taskTypes, token
    }
    const jsContent = `<script>(async (window)=>{
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
        })
        window.$sessionStorage = {
          getItem : (key) => postMessageAsync("${taskTypes.sessionStorage_getItem}", key),
          setItem : (key, value) => postMessageAsync("${taskTypes.sessionStorage_setItem}", [key, value])
        }
        window.$localStorage = {
          getItem : (key) => postMessageAsync("${taskTypes.localStorage_getItem}", key),
          openFile : (type, resultType) => postMessageAsync("${taskTypes.localStorage_openFile}", [type, resultType]),
          setItem : (key, value) => postMessageAsync("${taskTypes.localStorage_setItem}", [key, value])
        }
        await postMessageAsync("${taskTypes.heartBeat}")
      })(window)
    </script>`;
    return [context, jsContent]
}

export default function IFrameWithJs(props: { src: string, context?: IFrameContext }) {
    const ref = React.createRef<HTMLIFrameElement>()
    const getSecureKey = (key: string) => `H5Apps_${key}`
    const locator = useServicesLocator()
    useEffect(() => {
        if (!props.context) {
            return
        }
        const viewService = locator.locate(IViewService)
        const langs = locator.locate(ILangsService)
        const { token, taskTypes } = props.context;
        let lastHeartBeatTime = Date.now()
        let clientWindow: Window
        const listener = async (ev: MessageEvent) => {
            if (!ev.data || ev.data.token !== token) {
                return;
            }
            ev.stopPropagation();
            const w = ev.source as Window;
            const reply = (result: string | null | undefined | { file: File, data?: any }) =>
                w.postMessage(
                    {
                        token,
                        taskId: ev.data.taskId,
                        taskResult: result,
                    },
                    "*"
                );
            if (ev.data.taskType === taskTypes.heartBeat) {
                lastHeartBeatTime = Date.now();
                clientWindow = w;
                reply(null);
                return;
            }
            let res: any;
            switch (ev.data.taskType) {
                case taskTypes.sessionStorage_getItem:
                    res =
                        window.sessionStorage.getItem(getSecureKey(ev.data.taskData));
                    reply(res);
                    return;
                case taskTypes.sessionStorage_setItem:
                    window.sessionStorage.setItem(
                        getSecureKey(ev.data.taskData[0]),
                        ev.data.taskData[1]
                    );
                    reply(null);
                    return;
                case taskTypes.localStorage_getItem:
                    res = window.localStorage.getItem(getSecureKey(ev.data.taskData));
                    reply(res);
                    return;
                case taskTypes.localStorage_setItem:
                    window.localStorage.setItem(
                        getSecureKey(ev.data.taskData[0]),
                        ev.data.taskData[1]
                    );
                    reply(null);
                    return;
                case taskTypes.localStorage_openFile:
                    console.log("openfile");
                    const mimeType = ev.data.taskData[0] || undefined
                    const resultType = ev.data.taskData[1]
                    viewService.prompt(
                        langs.get(LangKeys.Import),
                        [
                            {
                                type: 'File',
                                value: null,
                                accept: mimeType
                            }
                        ],
                        async (file: File) => {
                            (() => {
                                const reader = new FileReader() as any;
                                const readAs = `readAs${resultType}`;
                                if (!reader[readAs]) {
                                    reply({ file: Object.assign({}, file) });
                                }
                                reader.onabort = () => reply(null);
                                reader.onerror = () => reply(null);
                                reader.onload = () => {
                                    reply({
                                        file: Object.assign({}, file),
                                        data: reader.result,
                                    });
                                };
                                reader[readAs](file);
                            })()
                            return true;
                        }, false)
                    return;
            }
            reply(null);
        };
        window.addEventListener("message", listener);
        return () => {
            window.removeEventListener("message", listener);
        }
    }, [])
    return <iframe ref={ref} src={props.src} sandbox="allow-scripts"></iframe>
}