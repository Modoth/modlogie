import './App.less'
import './App.css'
import { HashRouter } from 'react-router-dom'
import { MagicMaskProvider, MagicSeedProvider, UserContext, useServicesLocate, WikiLevelProvider } from './common/Contexts'
import ILoginAppservice, { ILoginUser } from '../app/Interfaces/ILoginAppservice'
import IViewService from '../app/Interfaces/IViewService'
import LoginService from '../app/AppServices/LoginService'
import Modlogie from './pages/Modlogie'
import Nav from './pages/Nav'
import NavContent from './pages/NavContent'
import React, { useState, useEffect } from 'react'
import ServiceView from './pages/ServiceView'
import IClocksAppService from '../app/Interfaces/IClocksAppService'
import IUserConfigsService from '../domain/ServiceInterfaces/IUserConfigsService'

let savedScrollTop = 0
let savedScrollElement: HTMLElement | null = null
const MagicMaskKey = 'Magic Mask Level'
const WikiLevelKey = 'Wiki Level Level'

export default function App (props: {magicMask: number, wikiLevel: number}) {
  const locate = useServicesLocate()
  const loginService: LoginService = (locate(
    ILoginAppservice
  ) as any) as LoginService
  const [user, setUser] = useState<ILoginUser>(loginService.user || {})
  loginService.onUserChanged = setUser
  const ref = React.createRef<HTMLDivElement>()
  const bgRef = React.createRef<HTMLStyleElement>()
  const [magicMask, setMagicMask] = useState(props.magicMask)
  const [wikiLevel, setWikiLevel] = useState(props.wikiLevel)
  const [magicSeed, setMagicSeed] = useState(Date.now())
  const configsService = locate(IUserConfigsService)
  useEffect(() => {
    (async () => {
      // if (bgRef.current) {
      //   const configService = locate(IConfigsService)
      //   const logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo
      //   bgRef.current.innerText = `.background{
      //     background-image: url("${logo}");
      //   }`
      // }
      locate(IViewService).setMagicMask = (m) => {
        setMagicMask(m)
        setMagicSeed(Date.now())
        configsService.set(MagicMaskKey, m)
      }
      locate(IViewService).setWikiLevel = (l) => {
        setWikiLevel(l)
        configsService.set(WikiLevelKey, l)
      }
      const clocksService = locate(IClocksAppService)
      await clocksService.init()
    })()
  }, [])
  return (
    <>
      <UserContext.Provider value={user}>
        <WikiLevelProvider value={wikiLevel}>
          <MagicMaskProvider value={magicMask}>
            <MagicSeedProvider value={magicSeed}>
              <ServiceView
                setContentVisiable={(v) => {
                  if (!ref.current) {
                    return
                  }
                  if (v) {
                  ref.current!.classList.remove('hidden')
                  const restore = () => {
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
            </MagicSeedProvider>
          </MagicMaskProvider>
        </WikiLevelProvider>
      </UserContext.Provider>
    </>
  )
}
