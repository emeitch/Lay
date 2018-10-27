export default class Edge {
  constructor(tail, label, head, rev=null) {
    this.tail = tail;
    this.label = label;
    this.head = head;
    this.rev = rev;
  }

  object(book) {
    return {
      tail: this.tail.object(book),
      label: this.label,
      head: this.head.object(book),
      rev: this.rev.object(book),
    };
  }
}
