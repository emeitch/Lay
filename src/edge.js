export default class Edge {
  constructor(tail, label, head, rev=null) {
    this.tail = tail;
    this.label = label;
    this.head = head;
    this.rev = rev;
  }
}
