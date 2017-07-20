import Val from './val';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(ctx) {
    const [func, ...rest] = this.terms;
    const args = rest.map(a => a.reduce(ctx));
    if (args.every(arg => arg.constructor === Val)) {
      return func.apply(...args);
    } else {
      return super.reduce(ctx);
    }
  }
}
