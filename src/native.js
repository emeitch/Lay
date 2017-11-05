import Val, { v } from './val';

export default class Native extends Val {
  constructor(f, args=[]) {
    super(f);
    this.args = args; // bound args
  }

  // todo5: このステップ部分は無くすか、applyなど別表現にできるはず
  step(book) {
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
