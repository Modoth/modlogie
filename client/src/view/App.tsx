import React, { useState, useEffect } from 'react'
import './App.less'
import { BrowserRouter as Router, HashRouter } from 'react-router-dom'
import { UserContext, useServicesLocator } from '../app/Contexts'
import LoginService from '../app/LoginService'
import Nav from './pages/Nav'
import NavContent from './pages/NavContent'
import ILoginService, { ILoginUser } from '../app/ILoginService'
import IViewService from './services/IViewService'
import ServicesLocator from '../common/ServicesLocator'
import ServiceView from './pages/ServiceView'
import ITextImageService from './services/ITextImageService'
import IConfigsService from '../domain/IConfigsSercice'
import ConfigKeys from '../app/ConfigKeys'

let savedScrollTop = 0
let savedScrollElement: HTMLElement | null = null

export default function App() {
  const locator = useServicesLocator() as ServicesLocator
  const loginService: LoginService = (locator.locate(
    ILoginService
  ) as any) as LoginService
  const [user, setUser] = useState<ILoginUser | undefined>(loginService.user)
  loginService.onUserChanged = setUser
  const ref = React.createRef<HTMLDivElement>()
  return (
    <>
      <UserContext.Provider value={user}>
        <ServiceView
          provide={(s) => locator.registerInstance(IViewService, s)}
          setContentVisiable={(v) => {
            if (!ref.current) {
              return
            }
            if (v) {
              ref.current!.classList.remove('hidden')
              setTimeout(() => {
                if (savedScrollElement) {
                  savedScrollElement.scrollTo({ top: savedScrollTop, behavior: undefined })
                  console.log(savedScrollElement, savedScrollTop)
                }
              }, 50);
            } else {
              savedScrollElement = document.scrollingElement as HTMLElement
              if (savedScrollElement) {
                savedScrollTop = savedScrollElement?.scrollTop
                savedScrollElement?.scrollTo(0, 0)
                console.log(savedScrollElement, savedScrollTop)
              }
              ref.current!.classList.add('hidden')
            }
          }}
        ></ServiceView>
        <div ref={ref}>
          <HashRouter >
            <Nav></Nav>
            <div className="nav-content-wrapper">
              <NavContent></NavContent>
            </div>
          </HashRouter>
        </div>
      </UserContext.Provider>
    </>
  )
}
