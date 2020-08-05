import * as jspb from "google-protobuf"

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb';
import * as messages_pb from './messages_pb';

export class KeyValue extends jspb.Message {
  getId(): string;
  setId(value: string): KeyValue;

  getValue(): string;
  setValue(value: string): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValue.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValue): KeyValue.AsObject;
  static serializeBinaryToWriter(message: KeyValue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValue;
  static deserializeBinaryFromReader(message: KeyValue, reader: jspb.BinaryReader): KeyValue;
}

export namespace KeyValue {
  export type AsObject = {
    id: string,
    value: string,
  }
}

export class KeyValueReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): KeyValueReply;

  getKeyValue(): KeyValue | undefined;
  setKeyValue(value?: KeyValue): KeyValueReply;
  hasKeyValue(): boolean;
  clearKeyValue(): KeyValueReply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValueReply.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValueReply): KeyValueReply.AsObject;
  static serializeBinaryToWriter(message: KeyValueReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValueReply;
  static deserializeBinaryFromReader(message: KeyValueReply, reader: jspb.BinaryReader): KeyValueReply;
}

export namespace KeyValueReply {
  export type AsObject = {
    error: messages_pb.Error,
    keyValue?: KeyValue.AsObject,
  }
}

export class KeyValuesReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): KeyValuesReply;

  getKeyValuesList(): Array<KeyValue>;
  setKeyValuesList(value: Array<KeyValue>): KeyValuesReply;
  clearKeyValuesList(): KeyValuesReply;
  addKeyValues(value?: KeyValue, index?: number): KeyValue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): KeyValuesReply.AsObject;
  static toObject(includeInstance: boolean, msg: KeyValuesReply): KeyValuesReply.AsObject;
  static serializeBinaryToWriter(message: KeyValuesReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): KeyValuesReply;
  static deserializeBinaryFromReader(message: KeyValuesReply, reader: jspb.BinaryReader): KeyValuesReply;
}

export namespace KeyValuesReply {
  export type AsObject = {
    error: messages_pb.Error,
    keyValuesList: Array<KeyValue.AsObject>,
  }
}

export class ServerKey extends jspb.Message {
  getKey(): string;
  setKey(value: string): ServerKey;

  getType(): ServerKey.Type;
  setType(value: ServerKey.Type): ServerKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerKey.AsObject;
  static toObject(includeInstance: boolean, msg: ServerKey): ServerKey.AsObject;
  static serializeBinaryToWriter(message: ServerKey, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerKey;
  static deserializeBinaryFromReader(message: ServerKey, reader: jspb.BinaryReader): ServerKey;
}

export namespace ServerKey {
  export type AsObject = {
    key: string,
    type: ServerKey.Type,
  }

  export enum Type { 
    STRING = 0,
    ENUM = 1,
    NUMBER = 2,
    BOOLEAN = 3,
  }
}

export class ServerKeysReply extends jspb.Message {
  getError(): messages_pb.Error;
  setError(value: messages_pb.Error): ServerKeysReply;

  getKeysList(): Array<ServerKey>;
  setKeysList(value: Array<ServerKey>): ServerKeysReply;
  clearKeysList(): ServerKeysReply;
  addKeys(value?: ServerKey, index?: number): ServerKey;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ServerKeysReply.AsObject;
  static toObject(includeInstance: boolean, msg: ServerKeysReply): ServerKeysReply.AsObject;
  static serializeBinaryToWriter(message: ServerKeysReply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ServerKeysReply;
  static deserializeBinaryFromReader(message: ServerKeysReply, reader: jspb.BinaryReader): ServerKeysReply;
}

export namespace ServerKeysReply {
  export type AsObject = {
    error: messages_pb.Error,
    keysList: Array<ServerKey.AsObject>,
  }
}

