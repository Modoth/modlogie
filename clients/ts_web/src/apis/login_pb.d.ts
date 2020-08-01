import * as jspb from "google-protobuf"

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as messages_pb from './messages_pb';
import * as users_pb from './users_pb';

export class Account extends jspb.Message {
  getName(): string;
  setName(value: string): Account;

  getPwd(): string;
  setPwd(value: string): Account;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Account.AsObject;
  static toObject(includeInstance: boolean, msg: Account): Account.AsObject;
  static serializeBinaryToWriter(message: Account, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Account;
  static deserializeBinaryFromReader(message: Account, reader: jspb.BinaryReader): Account;
}

export namespace Account {
  export type AsObject = {
    name: string,
    pwd: string,
  }
}

export class AccountReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): AccountReply;

  getName(): string;
  setName(value: string): AccountReply;

  getEmail(): string;
  setEmail(value: string): AccountReply;

  getType(): users_pb.User.Type;
  setType(value: users_pb.User.Type): AccountReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AccountReply.AsObject;
  static toObject(includeInstance: boolean, msg: AccountReply): AccountReply.AsObject;
  static serializeBinaryToWriter(message: AccountReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AccountReply;
  static deserializeBinaryFromReader(message: AccountReply, reader: jspb.BinaryReader): AccountReply;
}

export namespace AccountReply {
  export type AsObject = {
    error: messages_pb.Error,
    name: string,
    email: string,
    type: users_pb.User.Type,
  }
}

export class UpdateNameRequest extends jspb.Message {
  getNewname(): string;
  setNewname(value: string): UpdateNameRequest;

  getPassword(): string;
  setPassword(value: string): UpdateNameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateNameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateNameRequest): UpdateNameRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateNameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateNameRequest;
  static deserializeBinaryFromReader(message: UpdateNameRequest, reader: jspb.BinaryReader): UpdateNameRequest;
}

export namespace UpdateNameRequest {
  export type AsObject = {
    newname: string,
    password: string,
  }
}

export class UpdatePasswordRequest extends jspb.Message {
  getPassword(): string;
  setPassword(value: string): UpdatePasswordRequest;

  getNewpassword(): string;
  setNewpassword(value: string): UpdatePasswordRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePasswordRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePasswordRequest): UpdatePasswordRequest.AsObject;
  static serializeBinaryToWriter(message: UpdatePasswordRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePasswordRequest;
  static deserializeBinaryFromReader(message: UpdatePasswordRequest, reader: jspb.BinaryReader): UpdatePasswordRequest;
}

export namespace UpdatePasswordRequest {
  export type AsObject = {
    password: string,
    newpassword: string,
  }
}

