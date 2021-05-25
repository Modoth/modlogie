import './Home.less'
import { ArticleEnvProvider, useServicesLocate } from '../common/Contexts'
import { Button } from 'antd'
import { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'
import { ShuffleIcon } from '../common/Icons'
import IViewService from '../../app/Interfaces/IViewService'
import React, { useEffect } from 'react'
import SubjectsView from './SubjectsView'

export default function Home () {
  const locate = useServicesLocate()
  const viewService = locate(IViewService)
  useEffect(() => {
    viewService.setFloatingMenus?.(LangKeys.PageHome, <></>, <a href='#/random'>
      <Button size='large' shape='circle' type='primary'>
        <ShuffleIcon />
      </Button></a>)
    return () => {
      viewService.setFloatingMenus?.(LangKeys.PageHome)
    }
  }, [])
  return (
    <ArticleEnvProvider value={{ blurBG: false }}>
      <div className="home">
        <SubjectsView></SubjectsView>
      </div>
    </ArticleEnvProvider>
  )
}
