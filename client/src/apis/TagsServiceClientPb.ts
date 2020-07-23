/**
 * @fileoverview gRPC-Web generated client stub for moglogie.tags
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
  Tag,
  TagReply,
  TagsReply} from './tags_pb';

export class TagsServiceClient {
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
    TagsReply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    TagsReply.deserializeBinary
  );

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<TagsReply>;

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: TagsReply) => void): grpcWeb.ClientReadableStream<TagsReply>;

  getAll(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: TagsReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/moglogie.tags.TagsService/GetAll', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetAll,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/moglogie.tags.TagsService/GetAll',
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
        new URL('/moglogie.tags.TagsService/Delete', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDelete,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/moglogie.tags.TagsService/Delete',
    request,
    metadata || {},
    this.methodInfoDelete);
  }

  methodInfoAdd = new grpcWeb.AbstractClientBase.MethodInfo(
    TagReply,
    (request: Tag) => {
      return request.serializeBinary();
    },
    TagReply.deserializeBinary
  );

  add(
    request: Tag,
    metadata: grpcWeb.Metadata | null): Promise<TagReply>;

  add(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: TagReply) => void): grpcWeb.ClientReadableStream<TagReply>;

  add(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: TagReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/moglogie.tags.TagsService/Add', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAdd,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/moglogie.tags.TagsService/Add',
    request,
    metadata || {},
    this.methodInfoAdd);
  }

  methodInfoUpdateName = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: Tag) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateName(
    request: Tag,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateName(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateName(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/moglogie.tags.TagsService/UpdateName', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateName,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/moglogie.tags.TagsService/UpdateName',
    request,
    metadata || {},
    this.methodInfoUpdateName);
  }

  methodInfoUpdateValues = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: Tag) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateValues(
    request: Tag,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateValues(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateValues(
    request: Tag,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/moglogie.tags.TagsService/UpdateValues', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateValues,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/moglogie.tags.TagsService/UpdateValues',
    request,
    metadata || {},
    this.methodInfoUpdateValues);
  }

}

