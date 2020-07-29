import * as jspb from "google-protobuf"

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as messages_pb from './messages_pb';

export class NewFolderItem extends jspb.Message {
  getName(): string;
  setName(value: string): NewFolderItem;

  getChildrenList(): Array<NewFolderItem>;
  setChildrenList(value: Array<NewFolderItem>): NewFolderItem;
  clearChildrenList(): NewFolderItem;
  addChildren(value?: NewFolderItem, index?: number): NewFolderItem;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewFolderItem.AsObject;
  static toObject(includeInstance: boolean, msg: NewFolderItem): NewFolderItem.AsObject;
  static serializeBinaryToWriter(message: NewFolderItem, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewFolderItem;
  static deserializeBinaryFromReader(message: NewFolderItem, reader: jspb.BinaryReader): NewFolderItem;
}

export namespace NewFolderItem {
  export type AsObject = {
    name: string,
    childrenList: Array<NewFolderItem.AsObject>,
  }
}

export class AddFoldersRequest extends jspb.Message {
  getParentId(): string;
  setParentId(value: string): AddFoldersRequest;

  getAutoFix(): boolean;
  setAutoFix(value: boolean): AddFoldersRequest;

  getFoldersList(): Array<NewFolderItem>;
  setFoldersList(value: Array<NewFolderItem>): AddFoldersRequest;
  clearFoldersList(): AddFoldersRequest;
  addFolders(value?: NewFolderItem, index?: number): NewFolderItem;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddFoldersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddFoldersRequest): AddFoldersRequest.AsObject;
  static serializeBinaryToWriter(message: AddFoldersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddFoldersRequest;
  static deserializeBinaryFromReader(message: AddFoldersRequest, reader: jspb.BinaryReader): AddFoldersRequest;
}

export namespace AddFoldersRequest {
  export type AsObject = {
    parentId: string,
    autoFix: boolean,
    foldersList: Array<NewFolderItem.AsObject>,
  }
}

export class FileTag extends jspb.Message {
  getTagId(): string;
  setTagId(value: string): FileTag;

  getValue(): string;
  setValue(value: string): FileTag;

  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): FileTag;

  getContentType(): string;
  setContentType(value: string): FileTag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileTag.AsObject;
  static toObject(includeInstance: boolean, msg: FileTag): FileTag.AsObject;
  static serializeBinaryToWriter(message: FileTag, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileTag;
  static deserializeBinaryFromReader(message: FileTag, reader: jspb.BinaryReader): FileTag;
}

export namespace FileTag {
  export type AsObject = {
    tagId: string,
    value: string,
    content: Uint8Array | string,
    contentType: string,
  }
}

export class AddOrUpdateTagsRequest extends jspb.Message {
  getId(): string;
  setId(value: string): AddOrUpdateTagsRequest;

  getTagsList(): Array<FileTag>;
  setTagsList(value: Array<FileTag>): AddOrUpdateTagsRequest;
  clearTagsList(): AddOrUpdateTagsRequest;
  addTags(value?: FileTag, index?: number): FileTag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddOrUpdateTagsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddOrUpdateTagsRequest): AddOrUpdateTagsRequest.AsObject;
  static serializeBinaryToWriter(message: AddOrUpdateTagsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddOrUpdateTagsRequest;
  static deserializeBinaryFromReader(message: AddOrUpdateTagsRequest, reader: jspb.BinaryReader): AddOrUpdateTagsRequest;
}

export namespace AddOrUpdateTagsRequest {
  export type AsObject = {
    id: string,
    tagsList: Array<FileTag.AsObject>,
  }
}

export class AddOrUpdateTagsReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): AddOrUpdateTagsReply;

  getTagContentsList(): Array<string>;
  setTagContentsList(value: Array<string>): AddOrUpdateTagsReply;
  clearTagContentsList(): AddOrUpdateTagsReply;
  addTagContents(value: string, index?: number): AddOrUpdateTagsReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddOrUpdateTagsReply.AsObject;
  static toObject(includeInstance: boolean, msg: AddOrUpdateTagsReply): AddOrUpdateTagsReply.AsObject;
  static serializeBinaryToWriter(message: AddOrUpdateTagsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddOrUpdateTagsReply;
  static deserializeBinaryFromReader(message: AddOrUpdateTagsReply, reader: jspb.BinaryReader): AddOrUpdateTagsReply;
}

export namespace AddOrUpdateTagsReply {
  export type AsObject = {
    error: messages_pb.Error,
    tagContentsList: Array<string>,
  }
}

export class DeleteTagsRequest extends jspb.Message {
  getId(): string;
  setId(value: string): DeleteTagsRequest;

  getTagsList(): Array<FileTag>;
  setTagsList(value: Array<FileTag>): DeleteTagsRequest;
  clearTagsList(): DeleteTagsRequest;
  addTags(value?: FileTag, index?: number): FileTag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeleteTagsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DeleteTagsRequest): DeleteTagsRequest.AsObject;
  static serializeBinaryToWriter(message: DeleteTagsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeleteTagsRequest;
  static deserializeBinaryFromReader(message: DeleteTagsRequest, reader: jspb.BinaryReader): DeleteTagsRequest;
}

export namespace DeleteTagsRequest {
  export type AsObject = {
    id: string,
    tagsList: Array<FileTag.AsObject>,
  }
}

export class QueryRequest extends jspb.Message {
  getQuery(): Query | undefined;
  setQuery(value?: Query): QueryRequest;
  hasQuery(): boolean;
  clearQuery(): QueryRequest;

  getFilter(): string;
  setFilter(value: string): QueryRequest;

  getSkip(): number;
  setSkip(value: number): QueryRequest;

  getTake(): number;
  setTake(value: number): QueryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): QueryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: QueryRequest): QueryRequest.AsObject;
  static serializeBinaryToWriter(message: QueryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): QueryRequest;
  static deserializeBinaryFromReader(message: QueryRequest, reader: jspb.BinaryReader): QueryRequest;
}

export namespace QueryRequest {
  export type AsObject = {
    query?: Query.AsObject,
    filter: string,
    skip: number,
    take: number,
  }
}

export class Query extends jspb.Message {
  getParent(): string;
  setParent(value: string): Query;

  getWhere(): Condition | undefined;
  setWhere(value?: Condition): Query;
  hasWhere(): boolean;
  clearWhere(): Query;

  getOrderBy(): string;
  setOrderBy(value: string): Query;

  getOrderByDesc(): boolean;
  setOrderByDesc(value: boolean): Query;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Query.AsObject;
  static toObject(includeInstance: boolean, msg: Query): Query.AsObject;
  static serializeBinaryToWriter(message: Query, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Query;
  static deserializeBinaryFromReader(message: Query, reader: jspb.BinaryReader): Query;
}

export namespace Query {
  export type AsObject = {
    parent: string,
    where?: Condition.AsObject,
    orderBy: string,
    orderByDesc: boolean,
  }
}

export class Condition extends jspb.Message {
  getType(): Condition.ConditionType;
  setType(value: Condition.ConditionType): Condition;

  getProp(): string;
  setProp(value: string): Condition;

  getValue(): string;
  setValue(value: string): Condition;

  getChildrenList(): Array<Condition>;
  setChildrenList(value: Array<Condition>): Condition;
  clearChildrenList(): Condition;
  addChildren(value?: Condition, index?: number): Condition;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Condition.AsObject;
  static toObject(includeInstance: boolean, msg: Condition): Condition.AsObject;
  static serializeBinaryToWriter(message: Condition, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Condition;
  static deserializeBinaryFromReader(message: Condition, reader: jspb.BinaryReader): Condition;
}

export namespace Condition {
  export type AsObject = {
    type: Condition.ConditionType,
    prop: string,
    value: string,
    childrenList: Array<Condition.AsObject>,
  }

  export enum ConditionType { 
    NONE = 0,
    AND = 1,
    NOT = 2,
    OR = 3,
    HAS = 4,
    EQUAL = 5,
    CONTAINS = 6,
    STARTS_WITH = 7,
    ENDS_WITH = 8,
    GREATER_THAN = 9,
    GREATER_THAN_OR_EQUAL = 10,
    LESS_THEN_OR_EQUAL = 11,
  }
}

export class File extends jspb.Message {
  getId(): string;
  setId(value: string): File;

  getName(): string;
  setName(value: string): File;

  getPath(): string;
  setPath(value: string): File;

  getFileType(): File.FileType;
  setFileType(value: File.FileType): File;

  getParentId(): string;
  setParentId(value: string): File;

  getNormalFilesCount(): number;
  setNormalFilesCount(value: number): File;

  getContent(): string;
  setContent(value: string): File;

  getComment(): string;
  setComment(value: string): File;

  getTagsList(): Array<FileTag>;
  setTagsList(value: Array<FileTag>): File;
  clearTagsList(): File;
  addTags(value?: FileTag, index?: number): FileTag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): File.AsObject;
  static toObject(includeInstance: boolean, msg: File): File.AsObject;
  static serializeBinaryToWriter(message: File, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): File;
  static deserializeBinaryFromReader(message: File, reader: jspb.BinaryReader): File;
}

export namespace File {
  export type AsObject = {
    id: string,
    name: string,
    path: string,
    fileType: File.FileType,
    parentId: string,
    normalFilesCount: number,
    content: string,
    comment: string,
    tagsList: Array<FileTag.AsObject>,
  }

  export enum FileType { 
    NORMAL = 0,
    FOLDER = 1,
    RESOURCE = 2,
  }
}

export class FilesReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): FilesReply;

  getTotal(): number;
  setTotal(value: number): FilesReply;

  getVersion(): string;
  setVersion(value: string): FilesReply;

  getFilesList(): Array<File>;
  setFilesList(value: Array<File>): FilesReply;
  clearFilesList(): FilesReply;
  addFiles(value?: File, index?: number): File;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilesReply.AsObject;
  static toObject(includeInstance: boolean, msg: FilesReply): FilesReply.AsObject;
  static serializeBinaryToWriter(message: FilesReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilesReply;
  static deserializeBinaryFromReader(message: FilesReply, reader: jspb.BinaryReader): FilesReply;
}

export namespace FilesReply {
  export type AsObject = {
    error: messages_pb.Error,
    total: number,
    version: string,
    filesList: Array<File.AsObject>,
  }
}

export class AddRequest extends jspb.Message {
  getName(): string;
  setName(value: string): AddRequest;

  getFileType(): File.FileType;
  setFileType(value: File.FileType): AddRequest;

  getParentId(): string;
  setParentId(value: string): AddRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddRequest): AddRequest.AsObject;
  static serializeBinaryToWriter(message: AddRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddRequest;
  static deserializeBinaryFromReader(message: AddRequest, reader: jspb.BinaryReader): AddRequest;
}

export namespace AddRequest {
  export type AsObject = {
    name: string,
    fileType: File.FileType,
    parentId: string,
  }
}

export class AddResourceRequest extends jspb.Message {
  getType(): string;
  setType(value: string): AddResourceRequest;

  getContent(): Uint8Array | string;
  getContent_asU8(): Uint8Array;
  getContent_asB64(): string;
  setContent(value: Uint8Array | string): AddResourceRequest;

  getParentId(): string;
  setParentId(value: string): AddResourceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddResourceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddResourceRequest): AddResourceRequest.AsObject;
  static serializeBinaryToWriter(message: AddResourceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddResourceRequest;
  static deserializeBinaryFromReader(message: AddResourceRequest, reader: jspb.BinaryReader): AddResourceRequest;
}

export namespace AddResourceRequest {
  export type AsObject = {
    type: string,
    content: Uint8Array | string,
    parentId: string,
  }
}

export class ResourceReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): ResourceReply;

  getId(): string;
  setId(value: string): ResourceReply;

  getContentId(): string;
  setContentId(value: string): ResourceReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResourceReply.AsObject;
  static toObject(includeInstance: boolean, msg: ResourceReply): ResourceReply.AsObject;
  static serializeBinaryToWriter(message: ResourceReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResourceReply;
  static deserializeBinaryFromReader(message: ResourceReply, reader: jspb.BinaryReader): ResourceReply;
}

export namespace ResourceReply {
  export type AsObject = {
    error: messages_pb.Error,
    id: string,
    contentId: string,
  }
}

export class GetFilesRequest extends jspb.Message {
  getParentId(): string;
  setParentId(value: string): GetFilesRequest;

  getSkip(): number;
  setSkip(value: number): GetFilesRequest;

  getTake(): number;
  setTake(value: number): GetFilesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFilesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetFilesRequest): GetFilesRequest.AsObject;
  static serializeBinaryToWriter(message: GetFilesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFilesRequest;
  static deserializeBinaryFromReader(message: GetFilesRequest, reader: jspb.BinaryReader): GetFilesRequest;
}

export namespace GetFilesRequest {
  export type AsObject = {
    parentId: string,
    skip: number,
    take: number,
  }
}

export class FileReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): FileReply;

  getFile(): File | undefined;
  setFile(value?: File): FileReply;
  hasFile(): boolean;
  clearFile(): FileReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FileReply.AsObject;
  static toObject(includeInstance: boolean, msg: FileReply): FileReply.AsObject;
  static serializeBinaryToWriter(message: FileReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FileReply;
  static deserializeBinaryFromReader(message: FileReply, reader: jspb.BinaryReader): FileReply;
}

export namespace FileReply {
  export type AsObject = {
    error: messages_pb.Error,
    file?: File.AsObject,
  }
}

export class UpdateNameRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateNameRequest;

  getName(): string;
  setName(value: string): UpdateNameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateNameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateNameRequest): UpdateNameRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateNameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateNameRequest;
  static deserializeBinaryFromReader(message: UpdateNameRequest, reader: jspb.BinaryReader): UpdateNameRequest;
}

export namespace UpdateNameRequest {
  export type AsObject = {
    id: string,
    name: string,
  }
}

export class UpdateContentRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateContentRequest;

  getContent(): string;
  setContent(value: string): UpdateContentRequest;

  getResourceIdsList(): Array<string>;
  setResourceIdsList(value: Array<string>): UpdateContentRequest;
  clearResourceIdsList(): UpdateContentRequest;
  addResourceIds(value: string, index?: number): UpdateContentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateContentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateContentRequest): UpdateContentRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateContentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateContentRequest;
  static deserializeBinaryFromReader(message: UpdateContentRequest, reader: jspb.BinaryReader): UpdateContentRequest;
}

export namespace UpdateContentRequest {
  export type AsObject = {
    id: string,
    content: string,
    resourceIdsList: Array<string>,
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

export class MoveRequest extends jspb.Message {
  getId(): string;
  setId(value: string): MoveRequest;

  getParentid(): string;
  setParentid(value: string): MoveRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MoveRequest.AsObject;
  static toObject(includeInstance: boolean, msg: MoveRequest): MoveRequest.AsObject;
  static serializeBinaryToWriter(message: MoveRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MoveRequest;
  static deserializeBinaryFromReader(message: MoveRequest, reader: jspb.BinaryReader): MoveRequest;
}

export namespace MoveRequest {
  export type AsObject = {
    id: string,
    parentid: string,
  }
}

