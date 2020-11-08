import IFilesServiceBase from './IFilesServiceBase'
import Subject from './Subject'

export default class ISubjectsService extends IFilesServiceBase {
  all (rootChildName?: string): Promise<Subject[]> {
    throw new Error('Method not implemented.')
  }

  get (id: string): Promise<Subject | undefined> {
    throw new Error('Method not implemented.')
  }

  getByPath (path: string): Promise<Subject | undefined> {
    throw new Error('Method not implemented.')
  }

  add (name: string, parentId?: string): Promise<Subject> {
    throw new Error('Method not implemented.')
  }

  batchAdd (subjects: Subject[], parentId?: string) {
    throw new Error('Method not implemented.')
  }

  move (subjectId: string, parentId: string): Promise<Subject> {
    throw new Error('Method not implemented.')
  }

  delete (subjectId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }

  rename (name: string, subjectId: string): Promise<Subject> {
    throw new Error('Method not implemented.')
  }

  clearCache () {
    throw new Error('Method not implemented.')
  }

  setOrder (subjectId: string, order: number): Promise<void> {
    throw new Error('Method not implemented.')
  }

  setResource (subjectId: string, type: string, content: Uint8Array | string): Promise<string> {
    throw new Error('Method not implemented.')
  }

  resetResource (subjectId: string): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
