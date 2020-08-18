import * as jspb from "google-protobuf"

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
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

export class Keyword extends jspb.Message {
  getId(): string;
  setId(value: string): Keyword;

  getUrl(): string;
  setUrl(value: string): Keyword;

  getDescription(): string;
  setDescription(value: string): Keyword;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Keyword.AsObject;
  static toObject(includeInstance: boolean, msg: Keyword): Keyword.AsObject;
  static serializeBinaryToWriter(message: Keyword, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Keyword;
  static deserializeBinaryFromReader(message: Keyword, reader: jspb.BinaryReader): Keyword;
}

export namespace Keyword {
  export type AsObject = {
    id: string,
    url: string,
    description: string,
  }
}

export class KeywordReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): KeywordReply;

  getKeyword(): Keyword | undefined;
  setKeyword(value?: Keyword): KeywordReply;
  hasKeyword(): boolean;
  clearKeyword(): KeywordReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeywordReply.AsObject;
  static toObject(includeInstance: boolean, msg: KeywordReply): KeywordReply.AsObject;
  static serializeBinaryToWriter(message: KeywordReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeywordReply;
  static deserializeBinaryFromReader(message: KeywordReply, reader: jspb.BinaryReader): KeywordReply;
}

export namespace KeywordReply {
  export type AsObject = {
    error: messages_pb.Error,
    keyword?: Keyword.AsObject,
  }
}

export class KeywordsReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): KeywordsReply;

  getTotal(): number;
  setTotal(value: number): KeywordsReply;

  getKeywordsList(): Array<Keyword>;
  setKeywordsList(value: Array<Keyword>): KeywordsReply;
  clearKeywordsList(): KeywordsReply;
  addKeywords(value?: Keyword, index?: number): Keyword;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeywordsReply.AsObject;
  static toObject(includeInstance: boolean, msg: KeywordsReply): KeywordsReply.AsObject;
  static serializeBinaryToWriter(message: KeywordsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeywordsReply;
  static deserializeBinaryFromReader(message: KeywordsReply, reader: jspb.BinaryReader): KeywordsReply;
}

export namespace KeywordsReply {
  export type AsObject = {
    error: messages_pb.Error,
    total: number,
    keywordsList: Array<Keyword.AsObject>,
  }
}

