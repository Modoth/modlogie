export default class IServicesLocator {
  locate<TS> (ctor: { new(...args: any): TS }): TS & IServicesLocator {
    throw new Error('Method not implemented.')
  }
}

const locate = new IServicesLocator().locate

export type LocateFunction = typeof locate
