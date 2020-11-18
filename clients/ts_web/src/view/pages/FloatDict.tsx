import './FloatDict.less'
import { Button } from 'antd'
import { useLocatableOffset, useServicesLocator } from '../common/Contexts'
import IDictService, { CancleToken, DictInfo } from '../../domain/ServiceInterfaces/IDictService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export type FloatDictPosition = [number, number]|undefined
export default function FloatDict (props:{word:string, position:FloatDictPosition}) {
  const offset = useLocatableOffset()
  const [word, setWord] = useState('')
  const [origin, setOrigin] = useState('')
  const [url, setUrl] = useState<string | undefined>()
  const [info, setInfo] = useState<DictInfo | undefined>()
  const [position, setPosition] = useState<number>(0)
  const locator = useServicesLocator()
  const [store] = useState<{ cancleToken?: CancleToken, destoried?: boolean }>({})
  const clearLastCancleToken = () => {
    if (store.cancleToken) {
      store.cancleToken.cancled = true
      store.cancleToken = undefined
    }
  }
  const dictServer = useServicesLocator().locate(IDictService)
  const viewService = locator.locate(IViewService)
  const tryQuery = async () => {
    const w = props.word
    if (origin === props.word) {
      return
    }
    setOrigin(props.word)
    if (!w) {
      setWord(w)
      setUrl('')
      return
    }
    const queryWord = async (w: string, origin: string) => {
      clearLastCancleToken()
      const cancleToken: CancleToken = { cancled: false }
      store.cancleToken = cancleToken

      const url = await dictServer.queryUrl(w.toLowerCase())
      if (store.destoried) {
        return
      }
      const position = (props.position?.[1] || 0) + 10 + offset + (document.scrollingElement?.scrollTop || 0)
      if (cancleToken === store.cancleToken) {
        clearLastCancleToken()
        if (url) {
          setWord(w)
          setUrl(url)
          setPosition(position)
        } else if (w.length > 1) {
          // && (!w[0].match(/[a-zA-Z0-9]/)) && w[0].match(/\p{Script=Han}/u)
          // await queryWord(w[0], w)
          await queryWord(w.slice(0, w.length - 1), w)
        } else {
          setWord(origin)
          setUrl(url)
          setPosition(position)
        }
      }
    }
    await queryWord(w, w)
  }
  useEffect(() => {
    (async () => {
      store.cancleToken = { cancled: false }
      viewService.setLoading(true)
      try {
        const info = await dictServer.info(store.cancleToken)
        if (!store.destoried) {
          setInfo(info)
        }
      } catch (e) {
        console.log(e)
      } finally {
        clearLastCancleToken()
        viewService.setLoading(false)
      }
    })()
  }, [])
  useEffect(() => {
    tryQuery()
  }, [props.word])
  return <div className="float-dict-wraper">
    {url ? <div style={{ top: position }} className='float-dict'>
      <div className="title"><Button type="link" className='word'>{word || ''}</Button></div>
      <iframe src={url} sandbox=""></iframe> </div> : undefined
    }
  </div>
}
