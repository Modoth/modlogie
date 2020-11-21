import './DictView.less'
import { Button } from 'antd'
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useLocatableOffset, useServicesLocator } from '../common/Contexts'
import classNames from 'classnames'
import IDictService, { CancleToken } from '../../domain/ServiceInterfaces/IDictService'
import ILangsService from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import IWordsStorage from '../../domain/ServiceInterfaces/IWordsStorage'
import React, { useState, useEffect } from 'react'

export type FloatDictPosition = [number, number]|undefined

export default function DictView (props:{word:string, eg?:string, position?:FloatDictPosition, hidenMenu?:boolean}) {
  const offset = useLocatableOffset()
  const [word, setWord] = useState('')
  const [origin, setOrigin] = useState('')
  const [url, setUrl] = useState<string | undefined>()
  const [position, setPosition] = useState<number|undefined>()
  const locator = useServicesLocator()
  const [favorite, setFavorite] = useState(false)
  const [store] = useState<{ cancleToken?: CancleToken, destoried?: boolean }>({})
  const clearLastCancleToken = () => {
    if (store.cancleToken) {
      store.cancleToken.cancled = true
      store.cancleToken = undefined
    }
  }
  const langs = locator.locate(ILangsService)
  const wordService = locator.locate(IWordsStorage)
  const toogleFavorite = async () => {
    try {
      const nextFav = !favorite
      if (nextFav) {
        await wordService.add(word, props.eg)
      } else {
        await wordService.delete(word)
      }
      setFavorite(nextFav)
    } catch (e) {
      viewService!.errorKey(langs, e.message)
    }
  }
  const dictServer = locator.locate(IDictService)
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
      const position = !props.position ? undefined : (props.position?.[1] || 0) + 20 + offset + (document.scrollingElement?.scrollTop || 0)
      if (cancleToken === store.cancleToken) {
        let fav = false
        if (url) {
          fav = await wordService.existed(w)
        }
        clearLastCancleToken()
        if (url) {
          setFavorite(fav)
          setWord(w)
          setUrl(url)
          setPosition(position)
        } else if (w.length > 1) {
          // && (!w[0].match(/[a-zA-Z0-9]/)) && w[0].match(/\p{Script=Han}/u)
          // await queryWord(w[0], w)
          await queryWord(w.slice(0, w.length - 1), w)
        } else {
          setFavorite(false)
          setWord(origin)
          setUrl(url)
          setPosition(position)
        }
      }
    }
    await queryWord(w, w)
  }
  useEffect(() => {
    tryQuery()
  }, [props.word])
  return <div className={classNames('dict-view-wraper', props.position ? 'floating' : '')}>
    {url ? <div style={{ top: position }} className='dict-view'>
      {
        props.hidenMenu ? undefined
          : <div className="title">
            <Button type="link" className='word'>{word || ''}</Button>
            <Button onClick={toogleFavorite} type="link" icon={favorite ? < MinusCircleOutlined /> : <PlusCircleOutlined />}></Button>
          </div>
      }
      <iframe src={url} sandbox=""></iframe> </div> : undefined
    }
  </div>
}
