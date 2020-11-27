export class IKeyValueStorage<TValue> {
  get (key: string): Promise<TValue|undefined> {
    throw new Error('Method not implemented.')
  }

  set (key: string, value?: TValue): Promise<void> {
    throw new Error('Method not implemented.')
  }
}

export class ILocalKeyValueStorage<TValue> extends IKeyValueStorage<TValue> {

}

export class IRemoteKeyValueStorage<TValue> extends IKeyValueStorage<TValue> {

}

export default class IKeyValueStorageManager {
  get<TValue> (group:object):IKeyValueStorage<TValue> {
    throw new Error('Method not implemented.')
  }
}
