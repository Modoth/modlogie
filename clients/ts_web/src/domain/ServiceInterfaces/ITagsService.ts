export const TagNames = {
  AdditionalSectionPrefix: '_',
  HiddenSectionPrefix: '-',
  SmartHiddenSectionPrefix: '?',
  RESERVED_PREFIX: '__',
  LIKE_TAG_NAME: '__LIKE',
  DISLIKE_TAG_NAME: '__DISLIKE'
}

export enum TagType {
    STRING = 0,
    ENUM,
    NUMBER,
    BOOLEAN,
    ARTICLE,
    RESOURCE,
    DATE,
    LINK
}

export class Tag {
  constructor (public id: string, public name: string, public type: TagType, public values?: string[]) { }
}

export default class ITagsService {
  all (): Promise<Tag[]> {
    throw new Error('Method not implemented.')
  }

  add (name: string, type: TagType, values?: string[]): Promise<Tag> {
    throw new Error('Method not implemented.')
  }

  delete (name: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  updateName (oldName: string, name: string): Promise<any> {
    throw new Error('Method not implemented.')
  }

  updateValues (name: string, values?: string[]): Promise<any> {
    throw new Error('Method not implemented.')
  }

  get (name: string): Promise<Tag | undefined> {
    throw new Error('Method not implemented.')
  }

  getById (id: string): Promise<Tag | undefined> {
    throw new Error('Method not implemented.')
  }

  getValues (name: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  clearCache () {
    throw new Error('Method not implemented.')
  }
}
