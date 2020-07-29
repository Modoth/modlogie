import Subject from "./Subject";

export default class IMmConverter {
    convertFromSubjectsToMm(subjects: Subject[]): string {
        throw new Error('Method not implemented.')
    }

    convertFromMmToSubjects(mm: string, excludeRoot?: boolean): Subject[] {
        throw new Error('Method not implemented.')
    }
}