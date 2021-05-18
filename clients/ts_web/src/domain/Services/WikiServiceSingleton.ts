import { BinaryReader } from 'google-protobuf'
import { FilesServiceClient } from '../../impl/remote-apis/FilesServiceClientPb'
import { FileWeightsReply, GetFileWeightsRequest } from '../../impl/remote-apis/files_pb'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IWikiService, { WikiMap } from '../ServiceInterfaces/IWikiService'

export default class WikiServiceSingleton extends IServicesLocator implements IWikiService {
  private caches = new Map<string, WikiMap<string, number>>()
  private async getWeightsFromServer (rootName:string): Promise<WikiMap<string, number>> {
    const res = (await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(FilesServiceClient).getFileWeights(new GetFileWeightsRequest().setRootname(rootName), null)))
    let weights = res.getWeightsMap()
    const version = res.getVersion()
    if (!(weights && weights.getLength()) && version) {
      try {
        const cachedRes = new FileWeightsReply()
        const contentBase = (window.ENV_OVERRIDE || window.ENV || {}).CONTENT_BASE || ''
        const url = contentBase + version
        const reader = new BinaryReader(await (await fetch(url, contentBase ? { mode: 'cors' } : undefined)).arrayBuffer())
        FileWeightsReply.deserializeBinaryFromReader(cachedRes, reader)
        weights = cachedRes.getWeightsMap()
      } catch {
        return new Map<string, number>()
      }
    }
    return weights
  }

  async getWeights (rootName: string) : Promise<WikiMap<string, number>> {
    if (!this.caches.has(rootName)) {
      var weights = await this.getWeightsFromServer(rootName)
      this.caches.set(rootName, weights)
      return weights
    }
    return this.caches.get(rootName)!
  }
}
