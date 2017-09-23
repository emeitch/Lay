import Val from './val';
import Sym from './sym';
import Exp from './exp';
import Book from './book';

export default class Func extends Val {
  constructor(...args) {
    super(args);
    this.exp = args.pop();
    this.syms = args;
  }

  apply(book, ...args) {
    if (this.exp.constructor !== Exp) {
      // todo: 本当は実行文脈を作るのではなくExpと同様に値の置き換えをしたい
      const b = new Book(book);
      for (let i = 0; i < args.length; i++) {
        b.assign(this.syms[i].origin, args[i]);
      }
      return this.exp.reduce(b);
    }

    const syms = this.syms.concat();
    let terms = this.exp.terms;
    for (const arg of args) {
      const sym = syms.shift();
      terms = terms.map(t => sym.equals(t) ? arg : t);
    }

    const exp = new Exp(...terms);
    if (syms.length > 0) {
      const args = [...syms, exp];
      return new Func(...args);
    }

    return exp.reduce(book);
  }
}

export class Plus extends Func {
  constructor() {
    super(
      new Sym("x"),
      new Sym("y"),
      new Exp(
        (x, y) => x + y,
        new Sym("x"),
        new Sym("y")
      )
    );
  }
}
