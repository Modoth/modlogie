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
import defaultLogo from '../assets/logo.png'
import { uriTransformer } from 'react-markdown'
import INavigationService from './services/INavigationService'


let savedScrollTop = 0
let savedScrollElement: HTMLElement | null = null

export default function App() {
  const locator = useServicesLocator() as ServicesLocator
  const loginService: LoginService = (locator.locate(
    ILoginService
  ) as any) as LoginService
  const [user, setUser] = useState<ILoginUser>(loginService.user || {})
  loginService.onUserChanged = setUser
  const ref = React.createRef<HTMLDivElement>()
  const bgRef = React.createRef<HTMLStyleElement>()
  const navigateTo = async (title: string | undefined, url: string | undefined) => {
    var viewService = locator.locate(IViewService)
    viewService.setLoading(true);
    try {
      await locator.locate(INavigationService).promptGoto(title, url);
    }
    finally {
      viewService.setLoading(false);
    }
  }
  useEffect(() => {
    (async () => {
      const configService = locator.locate(IConfigsService)
      var logo = await configService.getResource(ConfigKeys.WEB_SITE_LOGO) || defaultLogo;
      if (!bgRef.current) {
        return;
      }
      bgRef.current.innerText = `.background{
        background-image: url("${logo}");
      }`;
    })()
    window.document.body.onclick = (e) => {
      if ((e.target as any)?.nodeName === 'A') {
        const a: HTMLLinkElement = e.target as HTMLLinkElement
        e.stopPropagation();
        e.preventDefault();
        navigateTo(a.innerText.trim(), a.href && uriTransformer(a.href))
        return
      }
    }
  }, [])
  return (
    <>
      <UserContext.Provider value={user}>
        <ServiceView
          provide={(s) => {
            var viewService = locator.locate(IViewService)
            locator.registerInstance(IViewService, s)
            if (viewService) {
              s.onShowMenuChanged = viewService.onShowMenuChanged;
              s.setShowMenu(viewService.showMenu);
            }
          }}
          setContentVisiable={(v) => {
            if (!ref.current) {
              return
            }
            if (v) {
              ref.current!.classList.remove('hidden')
              setTimeout(() => {
                if (savedScrollElement) {
                  savedScrollElement.scrollTo({ top: savedScrollTop, behavior: undefined })
                }
              }, 50);
            } else {
              savedScrollElement = document.scrollingElement as HTMLElement
              if (savedScrollElement) {
                savedScrollTop = savedScrollElement?.scrollTop
                savedScrollElement?.scrollTo(0, 0)
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
      </UserContext.Provider>
    </>
  )
}
