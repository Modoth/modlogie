import './ManageDicts.less'
import { Button, Input } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useServicesLocator } from '../common/Contexts'
import DictView from './DictView'
import IDictService, { CancleToken, DictInfo } from '../../domain/ServiceInterfaces/IDictService'
import ILangsService, { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useState, useEffect } from 'react'

export default function ManageDicts () {
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [info, setInfo] = useState<DictInfo | undefined>()
  const locator = useServicesLocator()
  const langs = locator.locate(ILangsService)
  const [query, setQuery] = useState('我')
  const [store] = useState<{ cancleToken?: CancleToken, importing?: boolean, destoried?: boolean }>({})
  const clearLastCancleToken = () => {
    if (store.cancleToken) {
      store.cancleToken.cancled = true
      store.cancleToken = undefined
    }
  }
  const dictServer = useServicesLocator().locate(IDictService)
  const viewService = locator.locate(IViewService)
  const clearDict = async () => {
    if (!info || !info.itemCount || store.cancleToken || importing) {
      return
    }
    viewService.prompt(langs.get(LangKeys.ClearDict), [], async () => {
      if (store.cancleToken) {
        return true
      }
      viewService.setLoading(true)
      try {
        await dictServer.clean()
        if (!store.destoried) {
          setInfo(new DictInfo(0))
        }
      } catch (e) {
                viewService!.errorKey(langs, e.message)
                return false
      } finally {
        viewService.setLoading(false)
      }
      return true
    })
  }
  const selectDictFile = async () => {
    if (store.cancleToken) {
      return
    }
    viewService.prompt(
      langs.get(LangKeys.Import),
      [
        {
          type: 'File',
          value: null
        }
      ],
      async (file: File) => {
        (async () => {
          store.cancleToken = { cancled: false }
          setImporting(true)
          setImportProgress(0)
          store.importing = true
          viewService.setLoading(true)
          let newInfo = info
          try {
            newInfo = await dictServer.change(file, store.cancleToken, (i) => {
              if (!store.destoried) {
                setImportProgress(i)
              }
            })
          } catch (e) {
            viewService!.errorKey(langs, e.message)
          }
          clearLastCancleToken()
          store.importing = false
          if (!store.destoried) {
            setImporting(false)
            setInfo(newInfo)
          }
          viewService.setLoading(false)
        })()
        return true
      }, false)
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
  viewService.setFloatingMenus?.(ManageDicts.name, <>
    <Button size="large" type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => {
      if (importing) {
        return
      }
      selectDictFile()
    }}></Button>
    <Button size="large" type="primary" shape="circle" danger icon={<DeleteOutlined />} onClick={clearDict}></Button>
  </>)
  useEffect(() => {
    return () => {
      viewService.setFloatingMenus?.(ManageDicts.name)
    }
  }, [])
  return <div className="manage-dicts">
    <div className="dict-query-wraper">
      <div className='menu'>
        <Input placeholder={langs.get(LangKeys.Dict)} className="query" value={query} onChange={(e) => setQuery(e.target.value)}></Input>
        <Button className="menu-title" type="link" >{langs.get(LangKeys.ItemsCount)}{importing ? `${importProgress}%` : <span className="info">{(info && info.itemCount) || ''}</span>}</Button>
      </div>
      <div className="dict"> {query ? <DictView word={query} hidenMenu={true}></DictView> : undefined}</div>

    </div>
  </div >
}
