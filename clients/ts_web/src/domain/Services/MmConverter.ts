import { v4 as uuidv4 } from 'uuid'
import IMmConverter from '../ServiceInterfaces/IMmConverter'
import Subject from '../ServiceInterfaces/Subject'

export default class MmConverter implements IMmConverter {
  convertFromMmToSubjects (mm: string, excludeRoot?: boolean): Subject[] {
    const xml = new DOMParser().parseFromString(mm, 'application/xml')
    const root = xml.getRootNode().childNodes[0] as Element
    if (!root || root.localName !== 'map' || !root.childNodes) {
      return []
    }
    let subjectRoot: Element | undefined
    root.childNodes.forEach(n => {
      const child = n as Element
      if (child.localName === 'node') {
        subjectRoot = child
      }
    })
    if (!subjectRoot || subjectRoot!.localName !== 'node') {
      return []
    }
    const handleNode = (node: Element): Subject => {
      const sbj = new Subject()
      sbj.name = node.getAttribute('TEXT')!
      if (!node.childNodes) {
        return sbj
      }
      node.childNodes.forEach(n => {
        const child = n as Element
        if (child.localName === 'node') {
          sbj.children = sbj.children || []
          sbj.children.push(handleNode(child))
        }
      })
      return sbj
    }

    const rootSubject = handleNode(subjectRoot)
    if (excludeRoot) {
      return rootSubject.children || []
    }
    return [rootSubject]
  }

  convertFromSubjectsToMm (subjects: Subject[], rootNodeName?: string): string {
    const xml = new DOMParser().parseFromString('<map version="1.0.0"></map>', 'application/xml')
    let root: Element = xml.getRootNode().childNodes[0] as Element
    const handleSubject = (subject: Subject, parentNode: Node) => {
      const node = xml.createElement('node')
      node.setAttribute('ID', uuidv4())
      node.setAttribute('TEXT', subject.name)
      if (subject.children && subject.children.length) {
        subject.children.forEach(c => handleSubject(c, node))
      }
      parentNode.appendChild(node)
    }
    if (subjects.length > 1) {
      const newRoot = xml.createElement('node')
      newRoot.setAttribute('ID', uuidv4())
      newRoot.setAttribute('TEXT', rootNodeName || '')
      root.appendChild(newRoot)
      root = newRoot
    }
    subjects.forEach(s => handleSubject(s, root))
    return new XMLSerializer().serializeToString(xml)
  }
}
