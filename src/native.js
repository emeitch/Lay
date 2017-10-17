import Val, { v } from './val';
import { thunk } from './thunk';

export default class Native {
  constructor(f) {
    this.f = f;
  }

  apply(book, ...args) {
    const rargs = args.map(a => a.reduce(book));
    if ((this.f.length == 0 || this.f.length == rargs.length)
    && rargs.every(rarg => rarg.constructor === Val)) {
      const oargs = rargs.map(a => a.origin);
      const orig = this.f.apply(undefined, oargs);
      return v(orig);
    } else {
      return thunk(this, ...args);
    }
  }
}

export function native(...args) {
  return new Native(...args);
}
