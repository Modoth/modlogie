/**
 * @fileoverview gRPC-Web generated client stub for modlogie.login
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as messages_pb from './messages_pb';

import {
  Account,
  UserReply} from './login_pb';

export class LoginServiceClient {
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

  methodInfoLogin = new grpcWeb.AbstractClientBase.MethodInfo(
    UserReply,
    (request: Account) => {
      return request.serializeBinary();
    },
    UserReply.deserializeBinary
  );

  login(
    request: Account,
    metadata: grpcWeb.Metadata | null): Promise<UserReply>;

  login(
    request: Account,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: UserReply) => void): grpcWeb.ClientReadableStream<UserReply>;

  login(
    request: Account,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: UserReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.login.LoginService/Login', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoLogin,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.login.LoginService/Login',
    request,
    metadata || {},
    this.methodInfoLogin);
  }

  methodInfoCheckLogin = new grpcWeb.AbstractClientBase.MethodInfo(
    UserReply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    UserReply.deserializeBinary
  );

  checkLogin(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<UserReply>;

  checkLogin(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: UserReply) => void): grpcWeb.ClientReadableStream<UserReply>;

  checkLogin(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: UserReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.login.LoginService/CheckLogin', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoCheckLogin,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.login.LoginService/CheckLogin',
    request,
    metadata || {},
    this.methodInfoCheckLogin);
  }

  methodInfoLogout = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  logout(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  logout(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  logout(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.login.LoginService/Logout', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoLogout,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.login.LoginService/Logout',
    request,
    metadata || {},
    this.methodInfoLogout);
  }

}

