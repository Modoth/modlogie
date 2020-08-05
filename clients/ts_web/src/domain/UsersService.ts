import IUsersService, { User } from "./IUsersService"
import IServicesLocator from "../common/IServicesLocator"
import { UsersServiceClient } from "../apis/UsersServiceClientPb"
import { GetAllRequest, User as UserDto, AddRequest, UpdateStatusRequest, UpdateCommentRequest, UpdateTypeRequest, UpdateAuthorisionExpiredRequest } from "../apis/users_pb"
import { StringId } from "../apis/messages_pb";
import { ClientRun } from "../common/GrpcUtils";
import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import IConfigsService from "./IConfigsSercice";
import ConfigKeys from "../app/ConfigKeys";
import { LangKeys } from "./ILangsService";


export default class UsersService extends IServicesLocator implements IUsersService {

    async all(filter?: string, skip?: number, take?: number): Promise<[number, User[]]> {
        var res = await ClientRun(this, () => this.locate(UsersServiceClient).getAll(new GetAllRequest().setFilter(filter || '').setTake(take || 0).setSkip(skip || 0), null));
        var users = res.getUsersList().map(this.userFrom)
        return [res.getTotal(), users]

    }
    userFrom(dto: UserDto): User {
        return new User(dto.getId(), dto.getEmail(),
            dto.getStatus() == UserDto.Status.ENABLED,
            dto.getType() === UserDto.Type.AUTHORISED,
            dto.getAuthorisionExpired()!.toDate(),
            dto.getComment())
    }

    async add(name: string, email: string, password: string): Promise<User> {
        var res = await ClientRun(this, () => this.locate(UsersServiceClient).add(new AddRequest().setId(name).setEmail(email).setPassword(password || ''), null));
        var user = this.userFrom(res.getUser()!)
        return user;
    }

    async delete(name: string): Promise<void> {
        await ClientRun(this, () => this.locate(UsersServiceClient).delete(new StringId().setId(name), null));
    }

    async updateStatue(name: string, enable: boolean): Promise<void> {
        await ClientRun(this, () => this.locate(UsersServiceClient).updateStatus(new UpdateStatusRequest().setId(name).setUserStatus(enable ? UserDto.Status.ENABLED : UserDto.Status.DISABLED), null));
    }

    async updateType(name: string, authorised: boolean): Promise<void> {
        var request = new UpdateTypeRequest().setId(name).setUserType(authorised ? UserDto.Type.AUTHORISED : UserDto.Type.NORMAL);
        await ClientRun(this, () => this.locate(UsersServiceClient).updateType(request, null));
    }

    async updateAuthorisionExpired(name: string, expired: Date): Promise<void> {
        var request = new UpdateAuthorisionExpiredRequest().setId(name);
        var expiredTimeStamp = new Timestamp();
        expiredTimeStamp.fromDate(expired)
        request.setAuthorisionExpired(expiredTimeStamp)
        await ClientRun(this, () => this.locate(UsersServiceClient).updateAuthorisionExpired(request, null));
    }

    async updateComment(name: string, comment: string): Promise<void> {
        await ClientRun(this, () => this.locate(UsersServiceClient).updateComment(new UpdateCommentRequest().setId(name).setComment(comment), null));
    }
}