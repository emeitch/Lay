import Val from './val';

export default class Func {
  constructor(base=undefined, args=[]) {
    this.base = base;
    this.args = args;
  }

  get arity() {
    return this.base.arity;
  }

  apply(...args) {
    const allArgs = this.args.concat(args);
    if (allArgs.length < this.arity) {
      return new Func(this, allArgs);
    }

    return this._apply(...allArgs);
  }

  _apply(...args) {
    return this.base.apply(...args);
  }
}

export class Plus extends Func {
  get arity() {
    return 2;
  }

  _apply(...args) {
    const [fst, snd] = args;
    return new Val(fst.origin + snd.origin);
  }
}
