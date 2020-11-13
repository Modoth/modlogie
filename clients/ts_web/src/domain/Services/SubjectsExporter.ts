import IMmConverter from '../ServiceInterfaces/IMmConverter'
import IServicesLocator from '../../infrac/ServiceLocator/IServicesLocator'
import ISubjectsExporter from '../ServiceInterfaces/ISubjectsExporter'
import Seperators from '../ServiceInterfaces/Seperators'
import Subject from '../ServiceInterfaces/Subject'

export default class SubjectsExporter extends IServicesLocator implements ISubjectsExporter {
  export (subjects: Subject[]): void {
    const name = subjects.length === 1 ? subjects[0].name : (subjects.length > 1 ? (Seperators.joinItems(subjects.map(s => s.name)).slice(0, 20)) : 'download')
    const mm = this.locate(IMmConverter).convertFromSubjectsToMm(subjects, name)
    const a = document.createElement('a')
    a.target = '_blank'
    a.href = `data:application/octet-stream;;charset=utf-8,${encodeURIComponent(mm)}`
    a.download = `${name}.mm`
    a.click()
  }
}
