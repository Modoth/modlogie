/**
 * @fileoverview gRPC-Web generated client stub for modlogie.users
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb';
import * as messages_pb from './messages_pb';

import {
  AddRequest,
  GetAllRequest,
  UpdateAuthorisionExpiredRequest,
  UpdateCommentRequest,
  UpdateStatusRequest,
  UpdateTypeRequest,
  UserReply,
  UsersReply} from './users_pb';

export class UsersServiceClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: string; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: string; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodInfoGetAll = new grpcWeb.AbstractClientBase.MethodInfo(
    UsersReply,
    (request: GetAllRequest) => {
      return request.serializeBinary();
    },
    UsersReply.deserializeBinary
  );

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null): Promise<UsersReply>;

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: UsersReply) => void): grpcWeb.ClientReadableStream<UsersReply>;

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: UsersReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/GetAll', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetAll,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/GetAll',
    request,
    metadata || {},
    this.methodInfoGetAll);
  }

  methodInfoAdd = new grpcWeb.AbstractClientBase.MethodInfo(
    UserReply,
    (request: AddRequest) => {
      return request.serializeBinary();
    },
    UserReply.deserializeBinary
  );

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null): Promise<UserReply>;

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: UserReply) => void): grpcWeb.ClientReadableStream<UserReply>;

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: UserReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/Add', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAdd,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/Add',
    request,
    metadata || {},
    this.methodInfoAdd);
  }

  methodInfoDelete = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: messages_pb.StringId) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  delete(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  delete(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  delete(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/Delete', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDelete,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/Delete',
    request,
    metadata || {},
    this.methodInfoDelete);
  }

  methodInfoUpdateType = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: UpdateTypeRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateType(
    request: UpdateTypeRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateType(
    request: UpdateTypeRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateType(
    request: UpdateTypeRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/UpdateType', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateType,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/UpdateType',
    request,
    metadata || {},
    this.methodInfoUpdateType);
  }

  methodInfoUpdateAuthorisionExpired = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: UpdateAuthorisionExpiredRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateAuthorisionExpired(
    request: UpdateAuthorisionExpiredRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateAuthorisionExpired(
    request: UpdateAuthorisionExpiredRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateAuthorisionExpired(
    request: UpdateAuthorisionExpiredRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/UpdateAuthorisionExpired', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateAuthorisionExpired,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/UpdateAuthorisionExpired',
    request,
    metadata || {},
    this.methodInfoUpdateAuthorisionExpired);
  }

  methodInfoUpdateStatus = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: UpdateStatusRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateStatus(
    request: UpdateStatusRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateStatus(
    request: UpdateStatusRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateStatus(
    request: UpdateStatusRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/UpdateStatus', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateStatus,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/UpdateStatus',
    request,
    metadata || {},
    this.methodInfoUpdateStatus);
  }

  methodInfoUpdateComment = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: UpdateCommentRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateComment(
    request: UpdateCommentRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateComment(
    request: UpdateCommentRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateComment(
    request: UpdateCommentRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.users.UsersService/UpdateComment', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateComment,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.users.UsersService/UpdateComment',
    request,
    metadata || {},
    this.methodInfoUpdateComment);
  }

}

