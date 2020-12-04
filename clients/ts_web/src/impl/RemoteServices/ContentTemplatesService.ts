import { ContentTemplate as ContentTemplateDto } from '../remote-apis/contenttemplates_pb'
import { ContentTemplatesServiceClient } from '../remote-apis/ContenttemplatesServiceClientPb'
import { Empty } from 'google-protobuf/google/protobuf/empty_pb'
import { StringId } from '../remote-apis/messages_pb'
import IContentTemplatesService, { ContentTemplate } from '../../domain/ServiceInterfaces/IContentTemplatesService'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'

export default class ContentTemplatesService extends IServicesLocator implements IContentTemplatesService {
  ContentTemplateFrom (item :ContentTemplateDto):ContentTemplate {
    return {
      id: item.getId(),
      name: item.getName(),
      data: item.getData()
    }
  }

  async all (): Promise<ContentTemplate[]> {
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(ContentTemplatesServiceClient).getAll(
      new Empty(), null))
    return res.getContentTemplatesList().map(this.ContentTemplateFrom)
  }

  async delete (id: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(ContentTemplatesServiceClient).delete(new StringId().setId(id), null))
  }

  async add (name: string, data: string): Promise<string> {
    var res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(ContentTemplatesServiceClient).addOrUpdate(new ContentTemplateDto().setId('').setName(name).setData(data), null))
    return res.getId()
  }

  async update (id: string, data: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(ContentTemplatesServiceClient).addOrUpdate(new ContentTemplateDto().setId(id).setName('').setData(data), null))
  }
}
