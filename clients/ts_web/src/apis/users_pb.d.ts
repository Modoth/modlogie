import * as jspb from "google-protobuf"

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as messages_pb from './messages_pb';

export class GetAllRequest extends jspb.Message {
  getFilter(): string;
  setFilter(value: string): GetAllRequest;

  getSkip(): number;
  setSkip(value: number): GetAllRequest;

  getTake(): number;
  setTake(value: number): GetAllRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAllRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAllRequest): GetAllRequest.AsObject;
  static serializeBinaryToWriter(message: GetAllRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAllRequest;
  static deserializeBinaryFromReader(message: GetAllRequest, reader: jspb.BinaryReader): GetAllRequest;
}

export namespace GetAllRequest {
  export type AsObject = {
    filter: string,
    skip: number,
    take: number,
  }
}

export class User extends jspb.Message {
  getId(): string;
  setId(value: string): User;

  getEmail(): string;
  setEmail(value: string): User;

  getType(): User.Type;
  setType(value: User.Type): User;

  getAuthorisionExpired(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setAuthorisionExpired(value?: google_protobuf_timestamp_pb.Timestamp): User;
  hasAuthorisionExpired(): boolean;
  clearAuthorisionExpired(): User;

  getStatus(): User.Status;
  setStatus(value: User.Status): User;

  getComment(): string;
  setComment(value: string): User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: string,
    email: string,
    type: User.Type,
    authorisionExpired?: google_protobuf_timestamp_pb.Timestamp.AsObject,
    status: User.Status,
    comment: string,
  }

  export enum Type { 
    NORMAL = 0,
    AUTHORISED = 1,
    ADM = 2,
  }

  export enum Status { 
    DISABLED = 0,
    ENABLED = 1,
  }
}

export class UsersReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): UsersReply;

  getTotal(): number;
  setTotal(value: number): UsersReply;

  getUsersList(): Array<User>;
  setUsersList(value: Array<User>): UsersReply;
  clearUsersList(): UsersReply;
  addUsers(value?: User, index?: number): User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UsersReply.AsObject;
  static toObject(includeInstance: boolean, msg: UsersReply): UsersReply.AsObject;
  static serializeBinaryToWriter(message: UsersReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UsersReply;
  static deserializeBinaryFromReader(message: UsersReply, reader: jspb.BinaryReader): UsersReply;
}

export namespace UsersReply {
  export type AsObject = {
    error: messages_pb.Error,
    total: number,
    usersList: Array<User.AsObject>,
  }
}

export class UserReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): UserReply;

  getTotal(): number;
  setTotal(value: number): UserReply;

  getUser(): User | undefined;
  setUser(value?: User): UserReply;
  hasUser(): boolean;
  clearUser(): UserReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserReply.AsObject;
  static toObject(includeInstance: boolean, msg: UserReply): UserReply.AsObject;
  static serializeBinaryToWriter(message: UserReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserReply;
  static deserializeBinaryFromReader(message: UserReply, reader: jspb.BinaryReader): UserReply;
}

export namespace UserReply {
  export type AsObject = {
    error: messages_pb.Error,
    total: number,
    user?: User.AsObject,
  }
}

export class AddRequest extends jspb.Message {
  getId(): string;
  setId(value: string): AddRequest;

  getEmail(): string;
  setEmail(value: string): AddRequest;

  getPassword(): string;
  setPassword(value: string): AddRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddRequest): AddRequest.AsObject;
  static serializeBinaryToWriter(message: AddRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddRequest;
  static deserializeBinaryFromReader(message: AddRequest, reader: jspb.BinaryReader): AddRequest;
}

export namespace AddRequest {
  export type AsObject = {
    id: string,
    email: string,
    password: string,
  }
}

export class UpdateTypeRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateTypeRequest;

  getUserType(): User.Type;
  setUserType(value: User.Type): UpdateTypeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateTypeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateTypeRequest): UpdateTypeRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateTypeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateTypeRequest;
  static deserializeBinaryFromReader(message: UpdateTypeRequest, reader: jspb.BinaryReader): UpdateTypeRequest;
}

export namespace UpdateTypeRequest {
  export type AsObject = {
    id: string,
    userType: User.Type,
  }
}

export class UpdateAuthorisionExpiredRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateAuthorisionExpiredRequest;

  getAuthorisionExpired(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setAuthorisionExpired(value?: google_protobuf_timestamp_pb.Timestamp): UpdateAuthorisionExpiredRequest;
  hasAuthorisionExpired(): boolean;
  clearAuthorisionExpired(): UpdateAuthorisionExpiredRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateAuthorisionExpiredRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateAuthorisionExpiredRequest): UpdateAuthorisionExpiredRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateAuthorisionExpiredRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateAuthorisionExpiredRequest;
  static deserializeBinaryFromReader(message: UpdateAuthorisionExpiredRequest, reader: jspb.BinaryReader): UpdateAuthorisionExpiredRequest;
}

export namespace UpdateAuthorisionExpiredRequest {
  export type AsObject = {
    id: string,
    authorisionExpired?: google_protobuf_timestamp_pb.Timestamp.AsObject,
  }
}

export class UpdateStatusRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateStatusRequest;

  getUserStatus(): User.Status;
  setUserStatus(value: User.Status): UpdateStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateStatusRequest): UpdateStatusRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateStatusRequest;
  static deserializeBinaryFromReader(message: UpdateStatusRequest, reader: jspb.BinaryReader): UpdateStatusRequest;
}

export namespace UpdateStatusRequest {
  export type AsObject = {
    id: string,
    userStatus: User.Status,
  }
}

export class UpdateCommentRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateCommentRequest;

  getComment(): string;
  setComment(value: string): UpdateCommentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateCommentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateCommentRequest): UpdateCommentRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateCommentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateCommentRequest;
  static deserializeBinaryFromReader(message: UpdateCommentRequest, reader: jspb.BinaryReader): UpdateCommentRequest;
}

export namespace UpdateCommentRequest {
  export type AsObject = {
    id: string,
    comment: string,
  }
}

