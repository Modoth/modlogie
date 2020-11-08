import React, { useContext } from 'react'
import { ILoginUser } from '../../app/Interfaces/ILoginAppservice'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export const UserContext = React.createContext<ILoginUser>({} as ILoginUser)
export const useUser = () => useContext(UserContext)
export const UserProvider = UserContext.Provider

export const ServicesLocatorContext = React.createContext<IServicesLocator>(null!)
export const useServicesLocator = () => useContext(ServicesLocatorContext)
export const ServicesLocatorProvider = ServicesLocatorContext.Provider
