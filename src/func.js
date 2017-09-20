import Val from './val';
import Sym from './sym';
import Exp from './exp';

export default class Func extends Val {
  constructor(...args) {
    super(args);
    this.exp = args.pop();
    this.syms = args;
  }

  apply(book, ...args) {
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
