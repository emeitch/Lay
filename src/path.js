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

  step(book) {
    let v = this.receiver.reduce(book);
    for (const elm of this.keys) {
      let key;
      let args = [];
      if (Array.isArray(elm)) {
        const [top, ...rest] = elm;
        key = top;
        args = rest;
      } else {
        key = elm;
      }

      const k = key.reduce(book);
      const log = book.activeLog(v, k);
      if (!log) {
        return super.step(book);
      }
      const e = new Book(book);
      e.assign("self", log.id);

      if (args.length > 0) {
        v = log.val.apply(e, ...args).reduce(e);
      } else {
        v = log.val.reduce(e);
      }
    }
    return v;
  }
}
