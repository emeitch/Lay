import Comp from './val';
import Book from './book';
import { sym } from './sym';

export default class Exp extends Comp {
  constructor(...terms) {
    super(terms.map(t => typeof(t) === "string" ? sym(t) : t));
  }

  get terms() {
    return this.origin;
  }

  replace(matches) {
    const terms = this.terms.map(t => t.replace(matches));
    return new this.constructor(...terms);
  }

  step(book) {
    const [op, ...args] = this.terms;
    const f = op.step(book);
    if (f != op || !f.apply) {
      return new this.constructor(f, ...args);
    }

    return f.apply(book, ...args);
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
