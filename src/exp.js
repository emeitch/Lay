import Val from './val';
import Book from './book';
import { sym } from './sym';
import Native, { native } from './native';
import { func } from './func';

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

    if (op instanceof Native) {
      const rest = op.origin.length - args.length;
      if (rest <= 0) {
        // todo1: ここでnativeにargsを渡さなくても良いようにする
        const ntv = native(op.origin, args);
        return ntv.step(book);
      } else {
        let pats = [];
        for (var i = 0; i < rest; i++) {
          const vname = "__" + "arg_" + i + "__";
          pats.push(vname);
        }
        const e = exp(op, ...args.concat(pats));
        return func(...pats.concat([e]));
      }
    }

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
