export default class Subject {
    public id: string;
    public name: string;
    public path?: string;
    public totalArticleCount: number;
    public articleCount: number;
    public order:number;
    public iconUrl?: string;
    public parent?: Subject;
    public children?: Subject[]
    public clone(parent?: Subject): Subject {
        var sbj = Object.assign({}, this);
        sbj.parent = parent
        if (this.children) {
            sbj.children = this.children.map(s => s.clone(sbj));
        }
        return sbj;
    }
}
