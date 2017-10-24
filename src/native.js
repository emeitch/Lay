import Val, { v } from './val';

export default class Native {
  constructor(f, ...args) {
    this.f = f;
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
    if ((this.f.length === 0 || this.f.length === rargs.length)
    && rargs.every(rarg => rarg.constructor === Val)) {
      const oargs = rargs.map(a => a.origin);
      const orig = this.f.apply(undefined, oargs);
      return v(orig);
    } else {
      return new this.constructor(this.f, ...args);
    }
  }
}

export function native(...args) {
  return new Native(...args);
}
