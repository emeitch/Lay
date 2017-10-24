import Val, { v } from './val';

export default class Native extends Val {
  constructor(f, ...args) {
    super(f);
    this.args = args; // partial applicated args
  }

  apply(book, ...args) {
    if (args.length === 0) {
      return this;
    }

    this.args.forEach((arg, i) => {
      args.splice(i, 0, arg);
    });

    const rargs = args.map(a => a.reduce(book));
    if ((this.origin.length === 0 || this.origin.length === rargs.length)
    && rargs.every(rarg => rarg.constructor === Val)) {
      const oargs = rargs.map(a => a.origin);
      const orig = this.origin.apply(undefined, oargs);
      return v(orig);
    } else {
      return new this.constructor(this.origin, ...args);
    }
  }
}

export function native(...args) {
  return new Native(...args);
}
