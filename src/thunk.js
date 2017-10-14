import Val from './val';

export default class Thunk {
  constructor(f, ...args) {
    this.f = f;
    this.args = args;
  }

  apply(book, args) {
    this.args.forEach((arg, i) => {
      args.splice(i, 0, arg);
    });
    const rargs = args.map(a => a.reduce(book));
    if ((this.f.length == 0 || this.f.length == rargs.length)
    && rargs.every(rarg => rarg.constructor === Val)) {
      const oargs = rargs.map(a => a.origin);
      const orig = this.f.apply(undefined, oargs);
      return new Val(orig);
    } else {
      return new this.constructor(this.f, ...args);
    }
  }
}

export function thunk(...args) {
  return new Thunk(...args);
}
