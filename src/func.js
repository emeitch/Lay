import Val from './val';

export default class Func {
  constructor(base=undefined, args=[]) {
    this.base = base;
    this.args = args;
  }

  partialApply(...args) {
    const allArgs = this.args.concat(args);
    if (allArgs.length < this.arity) {
      return new Func(this, allArgs);
    }

    return undefined;
  }

  apply(...args) {
    const allArgs = this.args.concat(args);
    return this.base.apply(...allArgs);
  }
}

export class Plus extends Func {
  get arity() {
    return 2;
  }

  apply(...args) {
    const func = this.partialApply(...args);
    if (func) {
      return func;
    }

    const [fst, snd] = args;
    return new Val(fst.origin + snd.origin);
  }
}
