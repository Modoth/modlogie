import './App.less'
import './App.css'
import { HashRouter } from 'react-router-dom'
import { UserContext, useServicesLocate } from './common/Contexts'
import ConfigKeys from '../domain/ServiceInterfaces/ConfigKeys'
import defaultLogo from './assets/logo.png'
import IConfigsService from '../domain/ServiceInterfaces/IConfigsSercice'
import ILoginAppservice, { ILoginUser } from '../app/Interfaces/ILoginAppservice'
import INavigationService from '../app/Interfaces/INavigationService'
import IViewService from '../app/Interfaces/IViewService'
import LoginService from '../app/AppServices/LoginService'
import Modlogie from './pages/Modlogie'
import Nav from './pages/Nav'
import NavContent from './pages/NavContent'
import React, { useState, useEffect } from 'react'
import ServiceView from './pages/ServiceView'
import IClocksAppService from '../app/Interfaces/IClocksAppService'

let savedScrollTop = 0
let savedScrollElement: HTMLElement | null = null

export default function App () {
  const locate = useServicesLocate()
  const loginService: LoginService = (locate(
    ILoginAppservice
  ) as any) as LoginService
  const [user, setUser] = useState<ILoginUser>(loginService.user || {})
  loginService.onUserChanged = setUser
  const ref = React.createRef<HTMLDivElement>()
  const bgRef = React.createRef<HTMLStyleElement>()
  const navigateTo = async (title: string | undefined, url: string | undefined) => {
    const viewService = locate(IViewService)
    viewService.setLoading(true)
    try {
      await locate(INavigationService).promptGoto(title, url)
    } finally {
      viewService.setLoading(false)
    }
  }
  useEffect(() => {
    (async () => {
      // if (bgRef.current) {
      //   const configService = locate(IConfigsService)
      //   const logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo
      //   bgRef.current.innerText = `.background{
      //     background-image: url("${logo}");
      //   }`
      // }
      const clocksService = locate(IClocksAppService)
      await clocksService.init()
    })()
    window.document.body.onclick = (e) => {
      if ((e.target as any)?.nodeName === 'A') {
        const a: HTMLLinkElement = e.target as HTMLLinkElement
        if (a.href) {
          const u = new URL(a.href)
          if (u.origin === window.location.origin && u.pathname === '/' && (u.hash || u.search)) {
            return
          }
        }
        //todo: 
        if(a.parentElement?.className?.startsWith("ant-")){
          return
        }
        e.stopPropagation()
        e.preventDefault()
        navigateTo(((a as any).text || a.innerText || '').trim(), a.href)
      }
    }
  }, [])
  return (
    <>
      <UserContext.Provider value={user}>
        <ServiceView
          setContentVisiable={(v) => {
            if (!ref.current) {
              return
            }
            if (v) {
              ref.current!.classList.remove('hidden')
              const restore = ()=>{
                if (savedScrollElement) {
                  savedScrollElement.scrollTo({ top: savedScrollTop, behavior: undefined })
                }
              }
              restore()
              setTimeout(() => {
                restore()
              }, 0)
            } else {
              savedScrollElement = document.scrollingElement as HTMLElement
              if (savedScrollElement) {
                savedScrollTop = savedScrollElement?.scrollTop
                savedScrollElement.scrollTo(0, 0)
              }
              ref.current!.classList.add('hidden')
            }
          }}
        ></ServiceView>
        <div ref={ref} className="nav-content-wrapper">
          <HashRouter >
            <style ref={bgRef} >
            </style>
            <div className="background background-fixed"></div>
            <Nav></Nav>
            <NavContent></NavContent>
          </HashRouter>
        </div>
        <Modlogie></Modlogie>
      </UserContext.Provider>
    </>
  )
}
