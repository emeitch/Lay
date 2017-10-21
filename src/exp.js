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

  reduce(book=new Book()) {
    const [op, ...args] = this.terms;
    const func = op.reduce(book);
    return func.apply(book, ...args);
  }
}

export function exp(...args) {
  return new Exp(...args);
}
