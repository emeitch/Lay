export default class Edge {
  constructor(tail, label, head, prev=undefined) {
    this.tail = tail;
    this.label = label;
    this.head = head;
    this.prev = prev;
  }
}
