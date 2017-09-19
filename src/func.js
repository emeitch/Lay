import Val from './val';
import Book from './book';

export default class Func {
  constructor(...args) {
    this.exp = args.pop();
    this.syms = args;
  }

  get arity() {
    return this.syms.length;
  }

  apply(book, ...args) {
    if (args.length < this.arity) {
      return new PartialFunc(this, args);
    }

    return this._apply(book, ...args);
  }

  _apply(book, ...args) {
    const b = new Book(book);
    for (var i = 0; i < args.length; i++) {
      b.assign(this.syms[i].origin, args[i]);
    }

    return this.exp.reduce(b);
  }
}

class PartialFunc extends Func {
  constructor(base, args) {
    super();
    this.base = base;
    this.args = args;
  }

  get arity() {
    return this.base.arity;
  }

  apply(book, ...args) {
    const allArgs = this.args.concat(args);
    return super.apply(book, ...allArgs);
  }

  _apply(book, ...args) {
    return this.base._apply(book, ...args);
  }
}

export class Plus extends Func {
  get arity() {
    return 2;
  }

  _apply(book, ...args) {
    const [fst, snd] = args;
    return new Val(fst.origin + snd.origin);
  }
}
