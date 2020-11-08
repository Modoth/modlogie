export default class Subject {
    id: string;
    name: string;
    path?: string;
    totalArticleCount: number;
    articleCount: number;
    order:number;
    resourceUrl?: string;
    parent?: Subject;
    children?: Subject[]
    clone (parent?: Subject): Subject {
      const sbj = Object.assign({}, this)
      sbj.parent = parent
      if (this.children) {
        sbj.children = this.children.map(s => s.clone(sbj))
      }
      return sbj
    }
}
