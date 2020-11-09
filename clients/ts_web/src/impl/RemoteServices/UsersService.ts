import { GetAllRequest, User as UserDto, AddRequest, UpdateStatusRequest, UpdateCommentRequest, UpdateTypeRequest, UpdateAuthorisionExpiredRequest } from '../remote-apis/users_pb'
import { StringId } from '../remote-apis/messages_pb'
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb'
import { UsersServiceClient } from '../remote-apis/UsersServiceClientPb'
import IRemoteServiceInvoker from '../../infrac/ServiceLocator/IRemoteServiceInvoker'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import IUsersService, { User } from '../../domain/ServiceInterfaces/IUsersService'

export default class UsersService extends IServicesLocator implements IUsersService {
  async all (filter?: string, skip?: number, take?: number): Promise<[number, User[]]> {
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).getAll(new GetAllRequest().setFilter(filter || '').setTake(take || 0).setSkip(skip || 0), null))
    const users = res.getUsersList().map(this.userFrom)
    return [res.getTotal(), users]
  }

  userFrom (dto: UserDto): User {
    return new User(dto.getId(), dto.getEmail(),
      dto.getStatus() === UserDto.Status.ENABLED,
      dto.getType() === UserDto.Type.AUTHORISED,
            dto.getAuthorisionExpired()!.toDate(),
            dto.getComment())
  }

  async add (name: string, email: string, password: string): Promise<User> {
    const res = await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).add(new AddRequest().setId(name).setEmail(email).setPassword(password || ''), null))
    const user = this.userFrom(res.getUser()!)
    return user
  }

  async delete (name: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).delete(new StringId().setId(name), null))
  }

  async updateStatue (name: string, enable: boolean): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).updateStatus(new UpdateStatusRequest().setId(name).setUserStatus(enable ? UserDto.Status.ENABLED : UserDto.Status.DISABLED), null))
  }

  async updateType (name: string, authorised: boolean): Promise<void> {
    const request = new UpdateTypeRequest().setId(name).setUserType(authorised ? UserDto.Type.AUTHORISED : UserDto.Type.NORMAL)
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).updateType(request, null))
  }

  async updateAuthorisionExpired (name: string, expired: Date): Promise<void> {
    const request = new UpdateAuthorisionExpiredRequest().setId(name)
    const expiredTimeStamp = new Timestamp()
    expiredTimeStamp.fromDate(expired)
    request.setAuthorisionExpired(expiredTimeStamp)
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).updateAuthorisationExpired(request, null))
  }

  async updateComment (name: string, comment: string): Promise<void> {
    await this.locate(IRemoteServiceInvoker).invoke(() => this.locate(UsersServiceClient).updateComment(new UpdateCommentRequest().setId(name).setComment(comment), null))
  }
}
