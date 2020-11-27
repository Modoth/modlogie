import { IRemoteKeyValueStorage } from '../../domain/ServiceInterfaces/IKeyValueStorage'

export default class RemoteKeyValueStorage<TValue> implements IRemoteKeyValueStorage<TValue> {
  get (key: string): Promise<TValue> {
    throw new Error('Method not implemented.')
  }

  set (key: string, value: TValue): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
