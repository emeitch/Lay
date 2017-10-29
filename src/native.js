import Val, { v } from './val';

export default class Native extends Val {
  constructor(f, args=[]) {
    super(f);
    this.args = args; // bound args
  }

  bind(i, val) {
    if (i === -1) {
      return this;
    }

    const args = [];
    args[i] = val;
    this.args.forEach((arg, i) => {
      args.splice(i, 0, arg);
    });
    return new this.constructor(this.origin, args);
  }

  seq(book) {
    const rargs = this.args.map(a => a.reduce(book));
    const arity = this.origin.length;
    if ((arity === 0 || arity === rargs.length)
    && rargs.every(rarg => rarg.constructor === Val)) {
      const oargs = rargs.map(a => a.origin);
      const orig = this.origin.apply(undefined, oargs);
      return v(orig);
    } else {
      return this;
    }
  }
}

export function native(...args) {
  return new Native(...args);
}
