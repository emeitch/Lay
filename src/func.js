import Val from './val';

export default class Func {
  apply(...args) {
    if (args.length < this.arity) {
      return new PartialFunc(this, args);
    }

    return this._apply(...args);
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

  apply(...args) {
    const allArgs = this.args.concat(args);
    return super.apply(...allArgs);
  }

  _apply(...args) {
    return this.base._apply(...args);
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
