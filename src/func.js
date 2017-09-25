import Val from './val';
import Sym from './sym';
import Exp from './exp';

export default class Func extends Val {
  constructor(...args) {
    super(args);
    this.exp = args.pop();
    this.syms = args;
  }

  replace(sym, val) {
    const exp = this.exp.replace(sym, val);
    const args = [...this.syms, exp];
    return new Func(...args);
  }

  apply(book, ...args) {
    const syms = this.syms.concat();
    let exp = this.exp;
    for (const arg of args) {
      const sym = syms.shift();
      exp = exp.replace(sym, arg);
    }

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
