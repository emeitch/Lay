import Val from './val';
import Book from './book';
import { sym } from './sym';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms.map(t => typeof(t) === "string" ? sym(t) : t));
  }

  get terms() {
    return this.origin;
  }

  replace(book, sym, val) {
    const terms = this.terms.map(t => t.replace(book, sym, val));
    return new this.constructor(...terms);
  }

  step(book) {
    const [op, ...args] = this.terms;
    const func = op.step(book);
    if (func != op || !func.apply) {
      return new this.constructor(func, ...args);
    }

    return func.apply(book, ...args);
  }

  reduce(book=new Book()) {
    let prev = this;
    let e = this.step(book);
    while(!e.equals(prev)) {
      prev = e;
      e = e.step(book);
    }
    return e;
  }
}

export function exp(...args) {
  return new Exp(...args);
}
