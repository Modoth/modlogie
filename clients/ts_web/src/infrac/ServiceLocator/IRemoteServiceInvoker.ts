export default class IRemoteServiceInvoker{
    invoke<T extends { getError(): any }>(func: { (): Promise<T> }): Promise<T> {
    throw new Error('Method not implemented.')
    }
}