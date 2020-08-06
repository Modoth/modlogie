/**
 * @fileoverview gRPC-Web generated client stub for modlogie.file
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
  AddFoldersRequest,
  AddOrUpdateTagsReply,
  AddOrUpdateTagsRequest,
  AddRequest,
  AddResourceRequest,
  DeleteTagsRequest,
  FileReply,
  FilesReply,
  GetFilesRequest,
  IncDecTagRequest,
  MoveRequest,
  QueryRequest,
  ResourceReply,
  UpdateCommentRequest,
  UpdateContentRequest,
  UpdateNameRequest} from './files_pb';

export class FilesServiceClient {
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

  methodInfoGetFolders = new grpcWeb.AbstractClientBase.MethodInfo(
    FilesReply,
    (request: google_protobuf_empty_pb.Empty) => {
      return request.serializeBinary();
    },
    FilesReply.deserializeBinary
  );

  getFolders(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null): Promise<FilesReply>;

  getFolders(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FilesReply) => void): grpcWeb.ClientReadableStream<FilesReply>;

  getFolders(
    request: google_protobuf_empty_pb.Empty,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FilesReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/GetFolders', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetFolders,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/GetFolders',
    request,
    metadata || {},
    this.methodInfoGetFolders);
  }

  methodInfoAddFolders = new grpcWeb.AbstractClientBase.MethodInfo(
    FilesReply,
    (request: AddFoldersRequest) => {
      return request.serializeBinary();
    },
    FilesReply.deserializeBinary
  );

  addFolders(
    request: AddFoldersRequest,
    metadata: grpcWeb.Metadata | null): Promise<FilesReply>;

  addFolders(
    request: AddFoldersRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FilesReply) => void): grpcWeb.ClientReadableStream<FilesReply>;

  addFolders(
    request: AddFoldersRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FilesReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/AddFolders', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAddFolders,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/AddFolders',
    request,
    metadata || {},
    this.methodInfoAddFolders);
  }

  methodInfoGetFiles = new grpcWeb.AbstractClientBase.MethodInfo(
    FilesReply,
    (request: GetFilesRequest) => {
      return request.serializeBinary();
    },
    FilesReply.deserializeBinary
  );

  getFiles(
    request: GetFilesRequest,
    metadata: grpcWeb.Metadata | null): Promise<FilesReply>;

  getFiles(
    request: GetFilesRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FilesReply) => void): grpcWeb.ClientReadableStream<FilesReply>;

  getFiles(
    request: GetFilesRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FilesReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/GetFiles', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetFiles,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/GetFiles',
    request,
    metadata || {},
    this.methodInfoGetFiles);
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
        new URL('/modlogie.file.FilesService/Delete', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDelete,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/Delete',
    request,
    metadata || {},
    this.methodInfoDelete);
  }

  methodInfoAdd = new grpcWeb.AbstractClientBase.MethodInfo(
    FileReply,
    (request: AddRequest) => {
      return request.serializeBinary();
    },
    FileReply.deserializeBinary
  );

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null): Promise<FileReply>;

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FileReply) => void): grpcWeb.ClientReadableStream<FileReply>;

  add(
    request: AddRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FileReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/Add', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAdd,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/Add',
    request,
    metadata || {},
    this.methodInfoAdd);
  }

  methodInfoGetResourceById = new grpcWeb.AbstractClientBase.MethodInfo(
    FileReply,
    (request: messages_pb.StringId) => {
      return request.serializeBinary();
    },
    FileReply.deserializeBinary
  );

  getResourceById(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null): Promise<FileReply>;

  getResourceById(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FileReply) => void): grpcWeb.ClientReadableStream<FileReply>;

  getResourceById(
    request: messages_pb.StringId,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FileReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/GetResourceById', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoGetResourceById,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/GetResourceById',
    request,
    metadata || {},
    this.methodInfoGetResourceById);
  }

  methodInfoAddResource = new grpcWeb.AbstractClientBase.MethodInfo(
    ResourceReply,
    (request: AddResourceRequest) => {
      return request.serializeBinary();
    },
    ResourceReply.deserializeBinary
  );

  addResource(
    request: AddResourceRequest,
    metadata: grpcWeb.Metadata | null): Promise<ResourceReply>;

  addResource(
    request: AddResourceRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: ResourceReply) => void): grpcWeb.ClientReadableStream<ResourceReply>;

  addResource(
    request: AddResourceRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: ResourceReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/AddResource', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAddResource,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/AddResource',
    request,
    metadata || {},
    this.methodInfoAddResource);
  }

  methodInfoUpdateName = new grpcWeb.AbstractClientBase.MethodInfo(
    FileReply,
    (request: UpdateNameRequest) => {
      return request.serializeBinary();
    },
    FileReply.deserializeBinary
  );

  updateName(
    request: UpdateNameRequest,
    metadata: grpcWeb.Metadata | null): Promise<FileReply>;

  updateName(
    request: UpdateNameRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FileReply) => void): grpcWeb.ClientReadableStream<FileReply>;

  updateName(
    request: UpdateNameRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FileReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/UpdateName', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateName,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/UpdateName',
    request,
    metadata || {},
    this.methodInfoUpdateName);
  }

  methodInfoMove = new grpcWeb.AbstractClientBase.MethodInfo(
    FileReply,
    (request: MoveRequest) => {
      return request.serializeBinary();
    },
    FileReply.deserializeBinary
  );

  move(
    request: MoveRequest,
    metadata: grpcWeb.Metadata | null): Promise<FileReply>;

  move(
    request: MoveRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FileReply) => void): grpcWeb.ClientReadableStream<FileReply>;

  move(
    request: MoveRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FileReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/Move', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoMove,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/Move',
    request,
    metadata || {},
    this.methodInfoMove);
  }

  methodInfoUpdateContent = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: UpdateContentRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  updateContent(
    request: UpdateContentRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  updateContent(
    request: UpdateContentRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  updateContent(
    request: UpdateContentRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/UpdateContent', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateContent,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/UpdateContent',
    request,
    metadata || {},
    this.methodInfoUpdateContent);
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
        new URL('/modlogie.file.FilesService/UpdateComment', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoUpdateComment,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/UpdateComment',
    request,
    metadata || {},
    this.methodInfoUpdateComment);
  }

  methodInfoQuery = new grpcWeb.AbstractClientBase.MethodInfo(
    FilesReply,
    (request: QueryRequest) => {
      return request.serializeBinary();
    },
    FilesReply.deserializeBinary
  );

  query(
    request: QueryRequest,
    metadata: grpcWeb.Metadata | null): Promise<FilesReply>;

  query(
    request: QueryRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: FilesReply) => void): grpcWeb.ClientReadableStream<FilesReply>;

  query(
    request: QueryRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: FilesReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/Query', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoQuery,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/Query',
    request,
    metadata || {},
    this.methodInfoQuery);
  }

  methodInfoAddOrUpdateTags = new grpcWeb.AbstractClientBase.MethodInfo(
    AddOrUpdateTagsReply,
    (request: AddOrUpdateTagsRequest) => {
      return request.serializeBinary();
    },
    AddOrUpdateTagsReply.deserializeBinary
  );

  addOrUpdateTags(
    request: AddOrUpdateTagsRequest,
    metadata: grpcWeb.Metadata | null): Promise<AddOrUpdateTagsReply>;

  addOrUpdateTags(
    request: AddOrUpdateTagsRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: AddOrUpdateTagsReply) => void): grpcWeb.ClientReadableStream<AddOrUpdateTagsReply>;

  addOrUpdateTags(
    request: AddOrUpdateTagsRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: AddOrUpdateTagsReply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/AddOrUpdateTags', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoAddOrUpdateTags,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/AddOrUpdateTags',
    request,
    metadata || {},
    this.methodInfoAddOrUpdateTags);
  }

  methodInfoDeleteTags = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: DeleteTagsRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  deleteTags(
    request: DeleteTagsRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  deleteTags(
    request: DeleteTagsRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  deleteTags(
    request: DeleteTagsRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/DeleteTags', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoDeleteTags,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/DeleteTags',
    request,
    metadata || {},
    this.methodInfoDeleteTags);
  }

  methodInfoIncreaseTag = new grpcWeb.AbstractClientBase.MethodInfo(
    messages_pb.Reply,
    (request: IncDecTagRequest) => {
      return request.serializeBinary();
    },
    messages_pb.Reply.deserializeBinary
  );

  increaseTag(
    request: IncDecTagRequest,
    metadata: grpcWeb.Metadata | null): Promise<messages_pb.Reply>;

  increaseTag(
    request: IncDecTagRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void): grpcWeb.ClientReadableStream<messages_pb.Reply>;

  increaseTag(
    request: IncDecTagRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.Error,
               response: messages_pb.Reply) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        new URL('/modlogie.file.FilesService/IncreaseTag', this.hostname_).toString(),
        request,
        metadata || {},
        this.methodInfoIncreaseTag,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/modlogie.file.FilesService/IncreaseTag',
    request,
    metadata || {},
    this.methodInfoIncreaseTag);
  }

}

