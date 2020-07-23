import * as jspb from "google-protobuf"

export class Reply extends jspb.Message {
  getError(): Error;
  setError(value: Error): Reply;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Reply.AsObject;
  static toObject(includeInstance: boolean, msg: Reply): Reply.AsObject;
  static serializeBinaryToWriter(message: Reply, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Reply;
  static deserializeBinaryFromReader(message: Reply, reader: jspb.BinaryReader): Reply;
}

export namespace Reply {
  export type AsObject = {
    error: Error,
  }
}

export class StringId extends jspb.Message {
  getId(): string;
  setId(value: string): StringId;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StringId.AsObject;
  static toObject(includeInstance: boolean, msg: StringId): StringId.AsObject;
  static serializeBinaryToWriter(message: StringId, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StringId;
  static deserializeBinaryFromReader(message: StringId, reader: jspb.BinaryReader): StringId;
}

export namespace StringId {
  export type AsObject = {
    id: string,
  }
}

export enum Error { 
  NONE = 0,
  INVALID_USER_OR_PWD = 1,
  NO_SUCH_ENTITY = 2,
  ENTITY_CONFLICT = 3,
  INVALID_ARGUMENTS = 4,
  INVALID_OPERATION = 5,
}
