import * as jspb from "google-protobuf"

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as messages_pb from './messages_pb';

export class Tag extends jspb.Message {
  getId(): string;
  setId(value: string): Tag;

  getName(): string;
  setName(value: string): Tag;

  getType(): Tag.Type;
  setType(value: Tag.Type): Tag;

  getValues(): string;
  setValues(value: string): Tag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Tag.AsObject;
  static toObject(includeInstance: boolean, msg: Tag): Tag.AsObject;
  static serializeBinaryToWriter(message: Tag, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Tag;
  static deserializeBinaryFromReader(message: Tag, reader: jspb.BinaryReader): Tag;
}

export namespace Tag {
  export type AsObject = {
    id: string,
    name: string,
    type: Tag.Type,
    values: string,
  }

  export enum Type { 
    STRING = 0,
  }
}

export class TagReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): TagReply;

  getTag(): Tag | undefined;
  setTag(value?: Tag): TagReply;
  hasTag(): boolean;
  clearTag(): TagReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TagReply.AsObject;
  static toObject(includeInstance: boolean, msg: TagReply): TagReply.AsObject;
  static serializeBinaryToWriter(message: TagReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TagReply;
  static deserializeBinaryFromReader(message: TagReply, reader: jspb.BinaryReader): TagReply;
}

export namespace TagReply {
  export type AsObject = {
    error: messages_pb.Error,
    tag?: Tag.AsObject,
  }
}

export class TagsReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): TagsReply;

  getTagsList(): Array<Tag>;
  setTagsList(value: Array<Tag>): TagsReply;
  clearTagsList(): TagsReply;
  addTags(value?: Tag, index?: number): Tag;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TagsReply.AsObject;
  static toObject(includeInstance: boolean, msg: TagsReply): TagsReply.AsObject;
  static serializeBinaryToWriter(message: TagsReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TagsReply;
  static deserializeBinaryFromReader(message: TagsReply, reader: jspb.BinaryReader): TagsReply;
}

export namespace TagsReply {
  export type AsObject = {
    error: messages_pb.Error,
    tagsList: Array<Tag.AsObject>,
  }
}

