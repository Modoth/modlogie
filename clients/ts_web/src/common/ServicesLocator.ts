import IServicesLocator from './IServicesLocator'

export default class ServicesLocator implements IServicesLocator {
  private factories = new Map()
  private ctors = new Map()
  private singletonCtors = new Map()
  private singletonInstances = new Map()
  constructor() {
    this.locate = this.locate.bind(this)
  }

  locate<TS>(ctor: { new(...args: any): TS }): TS & IServicesLocator {
    if (this.singletonInstances.has(ctor)) {
      return this.singletonInstances.get(ctor)
    }
    if (this.singletonCtors.has(ctor)) {
      const Ctor = this.singletonCtors.get(ctor)
      const instance = new Ctor()
      instance.locate = this.locate
      this.singletonInstances.set(ctor, instance)
      return instance
    }
    if (this.factories.has(ctor)) {
      const factory = this.factories.get(ctor)
      const instance = factory();
      instance.locate = this.locate
      return instance;
    }
    if (this.ctors.has(ctor)) {
      const Ctor = this.ctors.get(ctor)
      const instance = new Ctor()
      instance.locate = this.locate
      return instance
    }
    return null as any
  }

  register<TInt, TImp extends TInt>(int: { new(...args: any): TInt }, imp: { new(): TImp }, singleton = false): any {
    if (singleton) {
      this.singletonCtors.set(int, imp)
    } else {
      this.ctors.set(int, imp)
    }
  }

  registerFactory<TInt>(int: { new(...args: any): TInt }, factory: { (): TInt }): any {
    this.factories.set(int, factory);
  }

  registerInstance<TInt, TImp extends TInt>(int: { new(...args: any): TInt }, instance: TImp): any {
    (instance as any).locate = this.locate
    this.singletonInstances.set(int, instance)
  }
}
