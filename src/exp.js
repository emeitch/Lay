import Val from './val';
import Book from './book';
import { sym } from './sym';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms.map(t => typeof(t) == "string" ? sym(t) : t));
  }

  get terms() {
    return this.origin;
  }

  replace(sym, val) {
    const terms = this.terms.map(
      t => t instanceof Val ? t.replace(sym, val) : t
    );
    return new Exp(...terms);
  }

  reduce(book=new Book()) {
    const [op, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(book));
    if (args.every(arg => arg.constructor === Val)) {
      if (op instanceof Function) {
        const oargs = args.map(a => a.origin);
        const orig = op.apply(undefined, oargs);
        return new Val(orig);
      } else {
        const func = op.reduce(book);
        return func.apply(book, ...args);
      }
    } else {
      return super.reduce(book);
    }
  }
}

export function exp(...args) {
  return new Exp(...args);
}
