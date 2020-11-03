/**
 * @fileoverview gRPC-Web generated client stub for modlogie.keyvalue
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
  KeyValue,
  KeyValueReply,
  KeyValuesReply,
  ServerKeysReply} from './keyvalues_pb';

export class KeyValuesServiceClient {
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
    KeyValuesReply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    KeyValuesReply.deserializeBinary
  );

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<KeyValuesReply>;

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: KeyValuesReply) => void): grpcWeb.ClientReadableStream<KeyValuesReply>;

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: KeyValuesReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyvalue.KeyValuesService/GetAll', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetAll,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyvalue.KeyValuesService/GetAll',
    request,
    metadata || {},
    this.methodInfoGetAll);
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
        new URL('/modlogie.keyvalue.KeyValuesService/Delete', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDelete,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyvalue.KeyValuesService/Delete',
    request,
    metadata || {},
    this.methodInfoDelete);
  }

  methodInfoDeleteAll = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  deleteAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  deleteAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  deleteAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyvalue.KeyValuesService/DeleteAll', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDeleteAll,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyvalue.KeyValuesService/DeleteAll',
    request,
    metadata || {},
    this.methodInfoDeleteAll);
  }

  methodInfoAddOrUpdate = new grpcWeb.AbstractClientBase.MethodInfo(
    KeyValueReply,
    (request: KeyValue) => {
      return request.serializeBinary();
    },
    KeyValueReply.deserializeBinary
  );

  addOrUpdate(
    request: KeyValue,
    metadata: grpcWeb.Metadata | null): Promise<KeyValueReply>;

  addOrUpdate(
    request: KeyValue,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: KeyValueReply) => void): grpcWeb.ClientReadableStream<KeyValueReply>;

  addOrUpdate(
    request: KeyValue,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: KeyValueReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyvalue.KeyValuesService/AddOrUpdate', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAddOrUpdate,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyvalue.KeyValuesService/AddOrUpdate',
    request,
    metadata || {},
    this.methodInfoAddOrUpdate);
  }

  methodInfoGetAllServerKeys = new grpcWeb.AbstractClientBase.MethodInfo(
    ServerKeysReply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    ServerKeysReply.deserializeBinary
  );

  getAllServerKeys(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<ServerKeysReply>;

  getAllServerKeys(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: ServerKeysReply) => void): grpcWeb.ClientReadableStream<ServerKeysReply>;

  getAllServerKeys(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: ServerKeysReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.keyvalue.KeyValuesService/GetAllServerKeys', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetAllServerKeys,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.keyvalue.KeyValuesService/GetAllServerKeys',
    request,
    metadata || {},
    this.methodInfoGetAllServerKeys);
  }

}

