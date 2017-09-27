import Case, { alt } from './case';
import Sym from './sym';
import Exp from './exp';

export default class Func extends Case {
  constructor(...args) {
    super(alt(...args));
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
