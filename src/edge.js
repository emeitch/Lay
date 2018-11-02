import v from './v';

export default class Edge {
  constructor(tail, label, head, rev) {
    this.tail = v(tail);
    this.label = v(label);
    this.head = v(head);
    this.rev = v(rev);
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
