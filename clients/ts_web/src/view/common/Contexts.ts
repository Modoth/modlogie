import React, { useContext } from 'react'
import { ILoginUser } from '../../app/Interfaces/ILoginAppservice'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export const UserContext = React.createContext<ILoginUser>({} as ILoginUser)
export const useUser = () => useContext(UserContext)
export const UserProvider = UserContext.Provider

export const LocatableOffsetContext = React.createContext<number>(0)
export const useLocatableOffset = () => useContext(LocatableOffsetContext)
export const LocatableOffsetProvider = LocatableOffsetContext.Provider

export const MagicMaskContext = React.createContext<number>(0)
export const useMagicMask = () => useContext(MagicMaskContext)
export const MagicMaskProvider = MagicMaskContext.Provider

export const WikiLevelContext = React.createContext<number>(0)
export const useWikiLevel = () => useContext(WikiLevelContext)
export const WikiLevelProvider = WikiLevelContext.Provider

export const MagicSeedContext = React.createContext<number>(0)
export const useMagicSeed = () => useContext(MagicSeedContext)
export const MagicSeedProvider = MagicSeedContext.Provider

export const ArticleEnvContext = React.createContext<any>({})
export const useArticleEnv = () => useContext(ArticleEnvContext)
export const ArticleEnvProvider = ArticleEnvContext.Provider

export const DisableClozeHoverContext = React.createContext(false)
export const useDisableClozeHover = () => useContext(DisableClozeHoverContext)
export const DisableClozeHoverProvider = DisableClozeHoverContext.Provider

export const ServicesLocateContext = React.createContext(new IServicesLocator().locate)
export const useServicesLocate = () => useContext(ServicesLocateContext)
export const ServicesLocateProvider = ServicesLocateContext.Provider
