import Val from './val';

export default class Exp extends Val {
  constructor(...terms) {
    super(terms);
  }

  get terms() {
    return this.origin;
  }

  reduce(_env) {
    const [func, ...args] = this.terms;
    if (args.every((arg) => arg.constructor === Val)) {
      return func.apply(...args);
    }

    return super.reduce(_env);
  }
}
