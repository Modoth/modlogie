import Subject from './Subject'

export default class ISubjectsService implements ISubjectsService {
  all(): Promise<Subject[]> {
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
}
