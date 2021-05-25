import './Home.less'
import React, { useEffect } from 'react'
import SubjectsView from './SubjectsView'
import { ArticleEnvProvider, useServicesLocate } from '../common/Contexts'
import IViewService from '../../app/Interfaces/IViewService'
import { LangKeys } from '../../domain/ServiceInterfaces/ILangsService'

export default function Home () {
  const locate = useServicesLocate()
  const viewService = locate(IViewService)
  useEffect(() => {
    viewService.setFloatingMenus?.(LangKeys.PageHome, <></>, <></>)
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
