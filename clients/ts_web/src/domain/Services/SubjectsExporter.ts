import IMmConverter from '../ServiceInterfaces/IMmConverter'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ISubjectsExporter from '../ServiceInterfaces/ISubjectsExporter'
import Subject from '../ServiceInterfaces/Subject'

export default class SubjectsExporter extends IServicesLocator implements ISubjectsExporter {
  export (subjects: Subject[]): void {
    let name = subjects.length === 1 ? subjects[0].name : (subjects.length > 1 ? (subjects.map(s => s.name).join(', ').slice(0, 20)) : 'download')
    let mm = this.locate(IMmConverter).convertFromSubjectsToMm(subjects, name)
    let a = document.createElement('a')
    a.target = '_blank'
    a.href = `data:application/octet-stream;;charset=utf-8,${encodeURIComponent(mm)}`
    a.download = `${name}.mm`
    a.click()
  }
}
