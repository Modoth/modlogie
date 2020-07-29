import Subject from "./Subject";
import ISubjectsExporter from "./ISubjectsExporter";
import IServicesLocator from "../common/IServicesLocator";
import IMmConverter from "./IMmConverter";

export default class SubjectsExporter extends IServicesLocator implements ISubjectsExporter {
    export(subjects: Subject[]): void {
        var mm = this.locate(IMmConverter).convertFromSubjectsToMm(subjects);
        var name = subjects.length == 1 ? subjects[0].name : 'download'
        var a = document.createElement('a')
        a.href = `data:application/octet-stream;;charset=utf-8,${encodeURIComponent(mm)}`
        a.download = `${name}.mm`;
        a.click();
    }
}