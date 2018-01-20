import Comp from './val';
import Book from './book';
import Val from './val';
import { sym } from './sym';

export default class Exp extends Comp {
  constructor(...terms) {
    super(terms.map(t => typeof(t) === "string" ? sym(t) : t));
    this.head = sym(this.constructor.name);
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

  str() {
    return "Exp" + Val.stringify(this.terms);
  }
}

export function exp(...args) {
  return new Exp(...args);
}
