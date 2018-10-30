import v from './v';

export default class Edge {
  constructor(tail, label, head, rev) {
    this.tail = tail;
    this.label = v(label);
    this.head = head;
    this.rev = rev;
  }

  object(book) {
    return {
      tail: this.tail.object(book),
      label: this.label.object(book),
      head: this.head.object(book),
      rev: this.rev.object(book),
    };
  }
}
