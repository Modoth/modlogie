import React, { useContext } from 'react'
import { ILoginUser } from '../ILoginService'
import IServicesLocator from '../../common/IServicesLocator'

export const UserContext = React.createContext<ILoginUser|undefined>(undefined)
export const useUser = () => useContext(UserContext)
export const UserProvider = UserContext.Provider

export const ServicesLocatorContext = React.createContext<IServicesLocator>(null!)
export const useServicesLocator = () => useContext(ServicesLocatorContext)
export const ServicesLocatorProvider = ServicesLocatorContext.Provider
