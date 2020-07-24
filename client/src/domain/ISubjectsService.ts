import Subject from './Subject'
import IFilesServiceBase from './IFilesServiceBase'

export default class ISubjectsService extends IFilesServiceBase {
  all(rootChildName?: string): Promise<Subject[]> {
    throw new Error('Method not implemented.')
  }

  add(name: string, parentId?: string): Promise<Subject> {
    throw new Error('Method not implemented.')
  }

  delete(subjectId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  rename(name: string, subjectId: string): Promise<Subject> {
    throw new Error('Method not implemented.')
  }

  clearCache() {
    throw new Error("Method not implemented.")
  }

  setIcon(subjectId: string, type: string, content: Uint8Array): Promise<string> {
    throw new Error('Method not implemented.')
  }

  resetIcon(subjectId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
