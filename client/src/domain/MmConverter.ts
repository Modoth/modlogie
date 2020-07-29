import Subject from "./Subject";
import IMmConverter from "./IMmConverter";
import { v4 as uuidv4 } from 'uuid'


export default class MmConverter implements IMmConverter {
    convertFromMmToSubjects(mm: string, excludeRoot?: boolean): Subject[] {
        var xml = new DOMParser().parseFromString(mm, 'application/xml');
        var root = xml.getRootNode().childNodes[0] as Element;
        if (!root || root.localName !== 'map' || !root.childNodes) {
            return [];
        }
        var subjectRoot: Element | undefined = undefined;
        root.childNodes.forEach(n => {
            var child = n as Element;
            if (child.localName === 'node') {
                subjectRoot = child
            }
        })
        if (!subjectRoot || subjectRoot!.localName !== 'node') {
            return [];
        }
        const handleNode = (node: Element): Subject => {
            var sbj = new Subject();
            sbj.name = node.getAttribute('TEXT')!;
            if (!node.childNodes) {
                return sbj;
            }
            node.childNodes.forEach(n => {
                var child = n as Element;
                if (child.localName === 'node') {
                    sbj.children = sbj.children || []
                    sbj.children.push(handleNode(child))
                }
            })
            return sbj;
        }

        var rootSubject = handleNode(subjectRoot);
        if (excludeRoot) {
            return rootSubject.children || []
        }
        return [rootSubject];
    }
    convertFromSubjectsToMm(subjects: Subject[]): string {
        var xml = new DOMParser().parseFromString('<map version="1.0.0"></map>', 'application/xml')
        var root: Element = xml.getRootNode().childNodes[0] as Element;
        const handleSubject = (subject: Subject, parentNode: Node) => {
            var node = xml.createElement('node')
            node.setAttribute('ID', uuidv4())
            node.setAttribute('TEXT', subject.name)
            if (subject.children && subject.children.length) {
                subject.children.forEach(c => handleSubject(c, node))
            }
            parentNode.appendChild(node)
        }
        if (subjects.length > 1) {
            root = xml.createElement('node');
            root.setAttribute('ID', uuidv4())
            root.setAttribute('TEXT', '')
        }
        subjects.forEach(s => handleSubject(s, root));
        return new XMLSerializer().serializeToString(xml);
    }
}