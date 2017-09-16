import Ref from './ref';
import Book from './book';

export default class Path extends Ref {
  constructor(...ids) {
    super(ids);
  }

  get receiver() {
    const [receiver,] = this.origin;
    return receiver;
  }

  get keys() {
    const [, ...keys] = this.origin;
    return keys;
  }

  toString() {
    return this.origin.join("/");
  }

  reduce(book) {
    let v = this.receiver.reduce(book);
    for (const key of this.keys) {
      const k = key.reduce(book);
      const log = book.activeLog(v, k);
      if (!log) {
        return super.reduce(book);
      }
      const e = new Book(book);
      e.assign("self", log.id);
      v = log.val.reduce(e);
    }
    return v;
  }
}
