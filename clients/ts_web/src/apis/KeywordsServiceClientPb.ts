/**
 * @fileoverview gRPC-Web generated client stub for modlogie.keyword
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
  GetAllRequest,
  Keyword,
  KeywordReply,
  KeywordsReply} from './keywords_pb';

export class KeywordsServiceClient {
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
    KeywordsReply,
    (request: GetAllRequest) => {
      return request.serializeBinary();
    },
    KeywordsReply.deserializeBinary
  );

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null): Promise<KeywordsReply>;

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: KeywordsReply) => void): grpcWeb.ClientReadableStream<KeywordsReply>;

  getAll(
    request: GetAllRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: KeywordsReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyword.KeywordsService/GetAll', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetAll,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/GetAll',
    request,
    metadata || {},
    this.methodInfoGetAll);
  }

  methodInfoGet = new grpcWeb.AbstractClientBase.MethodInfo(
    KeywordReply,
    (request: messages_pb.StringId) => {
      return request.serializeBinary();
    },
    KeywordReply.deserializeBinary
  );

  get(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null): Promise<KeywordReply>;

  get(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: KeywordReply) => void): grpcWeb.ClientReadableStream<KeywordReply>;

  get(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: KeywordReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyword.KeywordsService/Get', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGet,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/Get',
    request,
    metadata || {},
    this.methodInfoGet);
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
        new URL('/modlogie.keyword.KeywordsService/Delete', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDelete,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/Delete',
    request,
    metadata || {},
    this.methodInfoDelete);
  }

  methodInfoAdd = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: Keyword) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  add(
    request: Keyword,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  add(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  add(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyword.KeywordsService/Add', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAdd,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/Add',
    request,
    metadata || {},
    this.methodInfoAdd);
  }

  methodInfoUpdateUrl = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: Keyword) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateUrl(
    request: Keyword,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateUrl(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateUrl(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyword.KeywordsService/UpdateUrl', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateUrl,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/UpdateUrl',
    request,
    metadata || {},
    this.methodInfoUpdateUrl);
  }

  methodInfoUpdateDescription = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: Keyword) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateDescription(
    request: Keyword,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateDescription(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateDescription(
    request: Keyword,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyword.KeywordsService/UpdateDescription', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateDescription,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyword.KeywordsService/UpdateDescription',
    request,
    metadata || {},
    this.methodInfoUpdateDescription);
  }

}

